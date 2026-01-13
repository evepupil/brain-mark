// =============================================
// Turso 数据库初始化脚本
// 运行: node scripts/init-db.js
// =============================================

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function initDatabase() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('错误: 请确保 .env.local 中配置了 TURSO_DATABASE_URL 和 TURSO_AUTH_TOKEN');
    process.exit(1);
  }

  console.log('连接到 Turso 数据库...');

  const db = createClient({ url, authToken });

  try {
    // 创建 scores 表
    console.log('创建 scores 表...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS scores (
        id TEXT PRIMARY KEY,
        test_type TEXT NOT NULL,
        result REAL NOT NULL,
        fingerprint TEXT NOT NULL,
        anonymous_id TEXT NOT NULL,
        metadata TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // 创建索引
    console.log('创建索引...');
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_scores_test_type_result
      ON scores(test_type, result)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_scores_type_fingerprint
      ON scores(test_type, fingerprint)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_scores_created_at
      ON scores(created_at)
    `);

    console.log('✅ 数据库初始化完成！');

    // 验证表是否创建成功
    const result = await db.execute('SELECT name FROM sqlite_master WHERE type="table"');
    console.log('已创建的表:', result.rows.map(r => r.name).join(', '));

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  }
}

initDatabase();
