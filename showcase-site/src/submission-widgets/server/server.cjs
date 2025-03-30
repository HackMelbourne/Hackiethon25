// server.cjs
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// 将 fs 的回调函数转换为 Promise
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

const app = express();
const PORT = 3001;

// 定义重要的路径
const DATA_DIR = path.join(__dirname, 'data');
const BANANA_IMAGES_DIR = path.join(DATA_DIR, 'bananaImagines');
const JSON_FILES_DIR = path.join(DATA_DIR, 'jsonFiles');
const BANANA_CATALOG_PATH = path.join(JSON_FILES_DIR, 'banana_catalog.json');

// 确保必要的目录存在
const ensureDirectoriesExist = async () => {
  try {
    if (!await existsAsync(DATA_DIR)) {
      await mkdirAsync(DATA_DIR, { recursive: true });
      console.log(`创建目录: ${DATA_DIR}`);
    }
    
    if (!await existsAsync(BANANA_IMAGES_DIR)) {
      await mkdirAsync(BANANA_IMAGES_DIR, { recursive: true });
      console.log(`创建目录: ${BANANA_IMAGES_DIR}`);
    }
    
    if (!await existsAsync(JSON_FILES_DIR)) {
      await mkdirAsync(JSON_FILES_DIR, { recursive: true });
      console.log(`创建目录: ${JSON_FILES_DIR}`);
    }
  } catch (error) {
    console.error(`确保目录存在时出错: ${error.message}`);
    throw error;
  }
};

// 读取 banana_catalog.json 文件
const getBananaCatalog = async () => {
  try {
    if (!await existsAsync(BANANA_CATALOG_PATH)) {
      console.warn(`香蕉目录文件不存在: ${BANANA_CATALOG_PATH}`);
      return {};
    }
    
    const catalogContent = await readFileAsync(BANANA_CATALOG_PATH, 'utf8');
    return JSON.parse(catalogContent);
  } catch (error) {
    console.error(`读取香蕉目录时出错: ${error.message}`);
    return {};
  }
};

// 获取香蕉名称
const getBananaName = async (bananaId) => {
  try {
    const catalog = await getBananaCatalog();
    return catalog[bananaId] || "Unknown Banana";
  } catch (error) {
    console.error(`获取香蕉名称时出错: ${error.message}`);
    return "Unknown Banana";
  }
};

// 获取图片的 MIME 类型
const getImageMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.svg': return 'image/svg+xml';
    default: return 'image/png';
  }
};

// 读取图片并转换为 Base64
const getImageAsBase64 = async (imagePath) => {
  try {
    if (!await existsAsync(imagePath)) {
      return null;
    }
    
    const imageBuffer = await readFileAsync(imagePath);
    const contentType = getImageMimeType(imagePath);
    return `data:${contentType};base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.error(`读取图片时出错: ${error.message}`);
    return null;
  }
};

// 启用中间件
app.use(cors());
app.use(express.json());

// 记录请求日志的中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(`发生错误: ${err.message}`);
  res.status(500).json({
    success: false,
    error: err.message || '服务器内部错误'
  });
});

// API 路由

// 检查用户名是否存在
app.get('/api/check-username', async (req, res) => {
  try {
    const username = req.query.username;
    if (!username) {
      return res.status(400).json({ success: false, error: '未提供用户名' });
    }
    
    await ensureDirectoriesExist();
    
    const collectionsFilePath = path.join(JSON_FILES_DIR, `${username}_collections.json`);
    const exists = await existsAsync(collectionsFilePath);
    
    res.json({
      success: true,
      exists: exists
    });
  } catch (error) {
    console.error(`检查用户名时出错: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建用户收集文件 - 已修改为支持现有用户直接登录
app.post('/api/create-collection', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, error: '未提供用户名' });
    }
    
    await ensureDirectoriesExist();
    
    const collectionsFilePath = path.join(JSON_FILES_DIR, `${username}_collections.json`);
    
    // 检查文件是否已存在，如果已存在则不再创建新文件
    if (await existsAsync(collectionsFilePath)) {
      return res.json({
        success: true,
        message: '用户已存在，使用现有账户'
      });
    }
    
    // 创建空的收集数组
    await writeFileAsync(collectionsFilePath, '[]', 'utf8');
    
    res.json({
      success: true,
      message: '收集文件创建成功'
    });
  } catch (error) {
    console.error(`创建收集文件时出错: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 读取图片并返回，同时返回香蕉的正式名称
app.get('/api/image', async (req, res) => {
  try {
    const imageName = req.query.name;
    if (!imageName) {
      return res.status(400).json({ success: false, error: '未提供图片名称' });
    }
    
    await ensureDirectoriesExist();
    
    const imagePath = path.join(BANANA_IMAGES_DIR, imageName);
    
    console.log(`请求图片: ${imageName}`);
    console.log(`完整路径: ${imagePath}`);
    
    // 检查文件是否存在
    if (!await existsAsync(imagePath)) {
      return res.status(404).json({ success: false, error: '图片文件不存在' });
    }
    
    // 获取图片的 MIME 类型
    const contentType = getImageMimeType(imagePath);
    
    // 读取图片文件
    const imageBuffer = await readFileAsync(imagePath);
    
    // 将图片转换为 Base64
    const base64Image = imageBuffer.toString('base64');
    
    // 获取香蕉名称
    const bananaId = imageName.replace('.png', '');
    const bananaName = await getBananaName(bananaId);
    
    // 返回 Base64 编码的图片和类型，以及香蕉名称
    res.json({
      success: true,
      data: `data:${contentType};base64,${base64Image}`,
      bananaName: bananaName
    });
    
  } catch (error) {
    console.error(`处理图片请求时出错: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新用户收集
app.post('/api/update-collection', async (req, res) => {
  try {
    const { username, bananaId, rarity } = req.body;
    
    if (!username || !bananaId || !rarity) {
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }
    
    await ensureDirectoriesExist();
    
    const collectionsFilePath = path.join(JSON_FILES_DIR, `${username}_collections.json`);
    
    // 检查收集文件是否存在
    if (!await existsAsync(collectionsFilePath)) {
      return res.status(404).json({ success: false, error: '用户收集文件不存在' });
    }
    
    // 读取当前收集
    const collectionsContent = await readFileAsync(collectionsFilePath, 'utf8');
    let collections = JSON.parse(collectionsContent);
    
    // 检查香蕉是否已存在于收集中
    const existingIndex = collections.findIndex(item => item.nickname === bananaId);
    
    if (existingIndex >= 0) {
      // 香蕉已存在，更新计数
      collections[existingIndex].status.count += 1;
    } else {
      // 香蕉不存在，添加新条目
      collections.push({
        nickname: bananaId,
        status: {
          count: 1,
          rarity: rarity.toLowerCase()
        }
      });
    }
    
    // 保存更新后的收集
    await writeFileAsync(collectionsFilePath, JSON.stringify(collections, null, 2), 'utf8');
    
    res.json({
      success: true,
      message: '收集已更新',
      collections: collections
    });
    
  } catch (error) {
    console.error(`更新收集时出错: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取用户收集
app.get('/api/get-collection', async (req, res) => {
  try {
    const username = req.query.username;
    
    if (!username) {
      return res.status(400).json({ success: false, error: '未提供用户名' });
    }
    
    await ensureDirectoriesExist();
    
    const collectionsFilePath = path.join(JSON_FILES_DIR, `${username}_collections.json`);
    
    // 检查收集文件是否存在
    if (!await existsAsync(collectionsFilePath)) {
      return res.status(404).json({ success: false, error: '用户收集文件不存在' });
    }
    
    // 读取当前收集
    const collectionsContent = await readFileAsync(collectionsFilePath, 'utf8');
    const collections = JSON.parse(collectionsContent);
    
    // 读取香蕉目录获取名称
    const bananaCatalog = await getBananaCatalog();
    
    // 为每个收集项添加图片数据和名称
    const collectionsWithData = await Promise.all(collections.map(async (item) => {
      try {
        // 获取香蕉名称
        const name = bananaCatalog[item.nickname] || "Unknown Banana";
        
        // 获取图片
        const imagePath = path.join(BANANA_IMAGES_DIR, `${item.nickname}.png`);
        const imageData = await getImageAsBase64(imagePath);
        
        return {
          ...item,
          name: name,
          imageData: imageData
        };
      } catch (error) {
        console.error(`处理收集项时出错: ${error.message}`);
        return {
          ...item,
          name: bananaCatalog[item.nickname] || "Unknown Banana",
          imageData: null
        };
      }
    }));
    
    res.json({
      success: true,
      collections: collectionsWithData
    });
    
  } catch (error) {
    console.error(`获取收集时出错: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 启动服务器
async function startServer() {
  try {
    // 确保必要的目录存在
    await ensureDirectoriesExist();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务已启动，运行在端口 ${PORT}`);
    });
  } catch (error) {
    console.error(`启动服务器时出错: ${error.message}`);
    process.exit(1);
  }
}

// 启动服务器
startServer();