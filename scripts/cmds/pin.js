const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const sharp = require("sharp");

module.exports = {
  config: {
    name: "pin",
    aliases: ["pinterest", "pinsearch"],
    version: "2.0",
    author: "Raphael ilom",
    role: 0,
    countDown: 10,
    longDescription: {
      en: "Get and manipulate images from Pinterest with advanced features",
    },
    category: "Search",
    guide: {
      en: "{pn} <search query> -<number of images> [options]\nOptions:\n-hd: High quality images\n-collage: Create a collage\n-effect <name>: Apply image effect (grayscale, sepia, invert)\nExample: {pn} cute cats -5 -hd -collage -effect sepia"
    },
    langs: {
      "en": {
        "missing": "Usage: {pn} cute cats -5 -hd -collage -effect sepia"
      }
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      const input = args.join(" ");
      const searchRegex = /(.+?)\s*-(\d+)/;
      const match = input.match(searchRegex);

      if (!match) {
        return message.reply("Invalid format. Use: <search query> -<number of images> [options]");
      }

      const [, keySearch, numberSearch] = match;
      const options = {
        hd: input.includes("-hd"),
        collage: input.includes("-collage"),
        effect: input.includes("-effect") ? input.split("-effect")[1].trim().split(" ")[0] : null
      };

      const res = await this.pinterestSearch(keySearch, parseInt(numberSearch), options.hd);
      const data = res.data;

      if (options.collage) {
        const collageBuffer = await this.createCollage(data, parseInt(numberSearch));
        if (options.effect) {
          const processedBuffer = await this.applyImageEffect(collageBuffer, options.effect);
          return this.sendImage(api, event, processedBuffer, `Collage of ${numberSearch} images for "${keySearch}" with ${options.effect} effect`);
        } else {
          return this.sendImage(api, event, collageBuffer, `Collage of ${numberSearch} images for "${keySearch}"`);
        }
      } else {
        const imgData = await this.downloadImages(data, parseInt(numberSearch), options.effect);
        return message.reply({
          attachment: imgData,
          body: `${numberSearch} images for "${keySearch}"${options.effect ? ` with ${options.effect} effect` : ""}`
        }, event.threadID, event.messageID);
      }
    } catch (error) {
      console.error(error);
      return api.sendMessage(`An error occurred: ${error.message}`, event.threadID, event.messageID);
    }
  },

  pinterestSearch: async function (query, limit, hd = false) {
    const { pintarest } = require('nayan-server');
    const res = await pintarest(encodeURIComponent(query));
    return {
      data: res.data.slice(0, limit).map(url => hd ? url.replace(/\/236x/g, "") : url)
    };
  },

  downloadImages: async function (urls, limit, effect = null) {
    const imgData = [];
    for (let i = 0; i < limit; i++) {
      const path = `${__dirname}/cache/${i + 1}.jpg`;
      const response = await axios.get(urls[i], { responseType: 'arraybuffer' });
      let buffer = Buffer.from(response.data, 'binary');
      
      if (effect) {
        buffer = await this.applyImageEffect(buffer, effect);
      }

      await fs.writeFile(path, buffer);
      imgData.push(fs.createReadStream(path));
    }
    return imgData;
  },

  createCollage: async function (urls, count) {
    const imagesPerRow = Math.ceil(Math.sqrt(count));
    const imageSize = 300;
    const padding = 10;
    const canvasSize = imageSize * imagesPerRow + padding * (imagesPerRow + 1);

    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / imagesPerRow);
      const col = i % imagesPerRow;
      const x = col * (imageSize + padding) + padding;
      const y = row * (imageSize + padding) + padding;

      const image = await loadImage(urls[i]);
      ctx.drawImage(image, x, y, imageSize, imageSize);
    }

    return canvas.toBuffer('image/jpeg');
  },

  applyImageEffect: async function (inputBuffer, effect) {
    let sharpImage = sharp(inputBuffer);
    
    switch (effect) {
      case 'grayscale':
        sharpImage = sharpImage.grayscale();
        break;
      case 'sepia':
        sharpImage = sharpImage.sepia();
        break;
      case 'invert':
        sharpImage = sharpImage.negate();
        break;
      default:
        return inputBuffer;
    }

    return await sharpImage.toBuffer();
  },

  sendImage: async function (api, event, imageBuffer, caption) {
    const tempFilePath = path.join(__dirname, "cache", `temp_${Date.now()}.jpg`);
    await fs.writeFile(tempFilePath, imageBuffer);
    
    return new Promise((resolve, reject) => {
      api.sendMessage({
        body: caption,
        attachment: fs.createReadStream(tempFilePath)
      }, event.threadID, (err) => {
        fs.unlink(tempFilePath);
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
