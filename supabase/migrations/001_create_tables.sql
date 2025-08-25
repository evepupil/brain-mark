-- 创建测试类型表
CREATE TABLE IF NOT EXISTS test_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name_en VARCHAR(100) NOT NULL,
  display_name_zh VARCHAR(100) NOT NULL,
  description_en TEXT,
  description_zh TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建分数记录表
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  test_type VARCHAR(50) NOT NULL,
  result NUMERIC NOT NULL,
  fingerprint VARCHAR(255) NOT NULL,
  anonymous_id VARCHAR(255) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (test_type) REFERENCES test_types(name)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_scores_test_type ON scores(test_type);
CREATE INDEX IF NOT EXISTS idx_scores_fingerprint ON scores(fingerprint);
CREATE INDEX IF NOT EXISTS idx_scores_anonymous_id ON scores(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at);
CREATE INDEX IF NOT EXISTS idx_scores_result ON scores(result);

-- 插入测试类型数据
INSERT INTO test_types (name, display_name_en, display_name_zh, description_en, description_zh) VALUES
('reaction', 'Reaction Time', '反应速度', 'Test your visual reflexes', '测试你的视觉反应能力'),
('memory', 'Number Memory', '数字记忆', 'Remember the longest number you can', '记住你能记住的最长数字'),
('visual', 'Visual Memory', '视觉记忆', 'Remember an increasingly large board of squares', '记住越来越大的方格板'),
('typing', 'Typing Speed', '打字速度', 'How fast are your fingers?', '你的手指有多快？'),
('sequence', 'Sequence Memory', '序列记忆', 'Remember an increasingly long sequence of button presses', '记住越来越长的按钮序列')
ON CONFLICT (name) DO NOTHING;

-- 启用行级安全策略
ALTER TABLE test_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- 创建策略允许匿名用户读取测试类型
CREATE POLICY "Allow anonymous read test_types" ON test_types
  FOR SELECT TO anon USING (true);

-- 创建策略允许匿名用户读取和插入分数
CREATE POLICY "Allow anonymous read scores" ON scores
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous insert scores" ON scores
  FOR INSERT TO anon WITH CHECK (true);

-- 授权给匿名用户
GRANT SELECT ON test_types TO anon;
GRANT SELECT, INSERT ON scores TO anon;
GRANT USAGE ON SEQUENCE scores_id_seq TO anon;
GRANT USAGE ON SEQUENCE test_types_id_seq TO anon;