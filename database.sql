CREATE DATABASE IF NOT EXISTS `ai_xiaofu_v3`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `ai_xiaofu_v3`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `display_name` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `last_login_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admin_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `price_min` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `price_max` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `duration_days` INT NOT NULL DEFAULT 0,
  `description` TEXT NULL,
  `is_hot` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_type` (`type`),
  KEY `idx_products_status_hot_sort` (`status`, `is_hot`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `knowledge_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `description` VARCHAR(255) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_knowledge_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `knowledge_articles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `summary` VARCHAR(500) NULL,
  `content` MEDIUMTEXT NOT NULL,
  `tags` VARCHAR(255) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'published',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_knowledge_articles_category` (`category_id`),
  KEY `idx_knowledge_articles_status_sort` (`status`, `sort_order`),
  CONSTRAINT `fk_knowledge_articles_category` FOREIGN KEY (`category_id`) REFERENCES `knowledge_categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tutorials` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `summary` VARCHAR(500) NULL,
  `content` MEDIUMTEXT NOT NULL,
  `cover_url` VARCHAR(255) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'published',
  `published_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tutorials_status_sort` (`status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sales_scripts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `script_type` VARCHAR(50) NOT NULL,
  `scene` VARCHAR(120) NULL,
  `content` MEDIUMTEXT NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sales_scripts_type_status` (`script_type`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_name` VARCHAR(120) NOT NULL,
  `customer_contact_mask` VARCHAR(120) NULL,
  `product_type` VARCHAR(50) NOT NULL,
  `demand_summary` TEXT NULL,
  `quoted_price_min` DECIMAL(10,2) NULL,
  `quoted_price_max` DECIMAL(10,2) NULL,
  `duration_days` INT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT '待沟通',
  `source` VARCHAR(50) NOT NULL DEFAULT 'manual',
  `note` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orders_status_created` (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_usage_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `scene` VARCHAR(50) NOT NULL,
  `prompt_excerpt` TEXT NULL,
  `response_excerpt` TEXT NULL,
  `provider` VARCHAR(50) NOT NULL DEFAULT 'deepseek',
  `model_name` VARCHAR(80) NULL,
  `blocked` TINYINT(1) NOT NULL DEFAULT 0,
  `fallback_used` TINYINT(1) NOT NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'success',
  `error_code` VARCHAR(20) NULL,
  `error_message` VARCHAR(255) NULL,
  `latency_ms` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ai_usage_logs_scene_created` (`scene`, `created_at`),
  KEY `idx_ai_usage_logs_status_created` (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `system_configs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `config_key` VARCHAR(100) NOT NULL,
  `config_value` MEDIUMTEXT NULL,
  `config_type` VARCHAR(30) NOT NULL DEFAULT 'string',
  `is_sensitive` TINYINT(1) NOT NULL DEFAULT 0,
  `description` VARCHAR(255) NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_system_configs_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `favorites` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `record_type` VARCHAR(30) NOT NULL,
  `record_id` BIGINT UNSIGNED NOT NULL,
  `title_snapshot` VARCHAR(200) NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_favorites_type_record` (`record_type`, `record_id`),
  KEY `idx_favorites_status_created` (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `history_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `record_type` VARCHAR(30) NOT NULL,
  `keyword` VARCHAR(255) NULL,
  `title_snapshot` VARCHAR(200) NULL,
  `content_snapshot` TEXT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_history_records_type_created` (`record_type`, `created_at`),
  KEY `idx_history_records_status_created` (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `products` (`name`, `type`, `price_min`, `price_max`, `duration_days`, `description`, `is_hot`, `sort_order`, `status`) VALUES
('企业官网', 'website', 3000, 8000, 10, '适合企业展示、品牌介绍、新闻动态和表单咨询。', 1, 10, 'active'),
('WordPress建站', 'wordpress', 2500, 7000, 7, '适合快速上线官网、博客、外贸展示和内容型网站。', 1, 20, 'active'),
('外贸独立站', 'foreign_trade', 6000, 18000, 20, '适合外贸获客、多语言展示、SEO和询盘转化。', 1, 30, 'active'),
('微信小程序', 'miniprogram', 5000, 15000, 18, '适合预约、展示、商城、服务工具等微信生态场景。', 1, 40, 'active'),
('AI工具网站', 'ai_tool', 8000, 25000, 25, '适合AI问答、内容生成、工具聚合和会员化扩展。', 1, 50, 'active'),
('商城系统', 'mall', 8000, 30000, 30, '适合商品、订单、支付、营销和后台管理。', 1, 60, 'active'),
('SEO优化', 'seo', 1500, 6000, 15, '适合关键词布局、站内优化、收录基础和内容建议。', 1, 70, 'active'),
('网站维护', 'maintenance', 800, 3000, 30, '适合日常更新、安全检查、备份和小功能调整。', 1, 80, 'active');

INSERT INTO `knowledge_categories` (`name`, `slug`, `description`, `sort_order`, `status`) VALUES
('建站基础', 'website-basics', '适合快速了解企业官网与展示站的核心组成。', 10, 'active'),
('域名服务器', 'domain-hosting', '覆盖域名、服务器、DNS 与备案基础。', 20, 'active'),
('WordPress', 'wordpress', '面向内容站、展示站和常用插件场景。', 30, 'active'),
('SEO 优化', 'seo', '覆盖关键词、收录、页面结构与基础优化。', 40, 'active'),
('AI 网站', 'ai-website', '面向 AI 工具站、内容站与工作流场景。', 50, 'active'),
('微信小程序', 'wechat-miniprogram', '面向微信生态内的展示与服务工具。', 60, 'active');

INSERT INTO `knowledge_articles` (`category_id`, `title`, `summary`, `content`, `tags`, `sort_order`, `status`) VALUES
(1, '企业官网标准页面怎么规划', '帮助客户快速理解首页、产品、案例、关于我们和联系页的作用。', '企业官网 MVP 一般至少包含：首页、产品/服务、案例、关于我们、联系页。首页负责价值表达，产品页负责转化，案例页负责信任背书，联系页负责线索收集。对建站接单场景来说，建议先明确客户行业、核心卖点和是否需要表单咨询。', '企业官网,页面规划,建站基础', 10, 'published'),
(2, '域名、服务器和备案的关系', '解释域名、服务器、SSL 与备案之间的常见问题。', '域名是访问入口，服务器用于承载网站程序与数据，SSL 负责 HTTPS 安全连接。中国大陆服务器通常需要备案，香港和海外服务器通常不要求国内备案。给客户沟通时，先确认上线地区、访问人群和预算。', '域名,服务器,备案,SSL', 20, 'published'),
(3, 'WordPress 建站适合哪些业务', '总结 WordPress 在官网、博客、内容站和外贸站中的适用性。', 'WordPress 适合内容管理需求强、上线速度要求高、预算中等的项目。常见用途包括企业官网、博客、案例展示、外贸内容站。若客户需要复杂业务流程，可以在 WordPress 基础上二次开发，或改为定制系统。', 'WordPress,官网,外贸站', 30, 'published'),
(4, 'SEO 基础优化先做什么', '帮助客户理解关键词、标题、内容与收录的基础动作。', 'SEO 首版先做：关键词梳理、页面标题描述、清晰的栏目结构、基础内容铺设、站点地图和基础测速优化。对预算有限客户，可以先做站内基础，再按阶段补充内容和外链。', 'SEO,关键词,收录', 40, 'published'),
(5, 'AI 工具站 MVP 如何控制范围', '总结 AI 工具网站首版应优先做的功能边界。', 'AI 工具站 MVP 建议先聚焦一个核心工作流，例如 AI 问答、内容生成或行业助手。第一阶段应优先完成输入、处理、结果展示、限流风控和基础后台，避免一开始堆太多复杂功能。', 'AI网站,MVP,产品规划', 50, 'published'),
(6, '微信小程序项目适合什么需求', '归纳预约、展示、服务工具和轻商城等典型场景。', '小程序适合微信生态内的轻量服务场景，例如预约、内容展示、查询工具、线索收集和轻电商。若客户高度依赖微信流量或希望免下载触达，小程序通常是高优先级方案。', '微信小程序,预约,展示', 60, 'published');

INSERT INTO `tutorials` (`title`, `summary`, `content`, `cover_url`, `sort_order`, `status`, `published_at`) VALUES
('域名购买与解析入门', '从购买到解析生效，帮助客户理解建站前置准备。', '教程内容包括：域名选择建议、常见后缀区别、DNS 解析记录类型与生效时间说明，以及上线前核对清单。', NULL, 10, 'published', NOW()),
('服务器选购与环境建议', '说明共享主机、轻量服务器和云主机的选型差异。', '教程内容包括：按预算选型、流量规模预估、Linux 基础环境、Node.js 与 PHP 常见部署方案。', NULL, 20, 'published', NOW()),
('WordPress 安装与首屏优化', '覆盖站点初始化、主题、插件和基础性能动作。', '教程内容包括：安装流程、伪静态、常用插件、图片压缩、缓存策略与基础安全加固。', NULL, 30, 'published', NOW()),
('网站上线前检查清单', '梳理备案、SSL、表单、统计代码和搜索引擎设置。', '教程内容包括：备案确认、HTTPS 启用、表单测试、统计埋点、页面死链检查与 robots/sitemap 设置。', NULL, 40, 'published', NOW());

INSERT INTO `sales_scripts` (`title`, `script_type`, `scene`, `content`, `sort_order`, `status`) VALUES
('价格异议处理：先解释价值再给范围', 'price_objection', '客户觉得报价偏高', '这个预算我理解的。建站价格主要和页面数量、功能复杂度、设计要求有关。我可以先按你的核心需求给你整理一个平台内可落地的方案和报价区间，你再看是否先做 MVP。', 10, 'active'),
('催单话术：推动补充需求', 'follow_up', '客户迟迟未给资料', '你这边如果方便，可以直接在平台里补充一下行业、参考站和预计上线时间，我这边就能更快帮你细化页面结构和报价范围。', 20, 'active'),
('售后话术：稳定客户预期', 'after_sales', '客户咨询维护服务', '后续维护这块可以一起安排，常见包括内容更新、备份、安全检查和小功能调整。我可以先按你的更新频率给你整理一个维护建议。', 30, 'active'),
('成交话术：引导平台内继续沟通', 'closing', '客户已有明确需求', '这个方向可以做的。我先在平台内帮你把功能、周期和报价范围梳理清楚，你确认没问题后，我们再按优先级推进。', 40, 'active');

INSERT INTO `system_configs` (`config_key`, `config_value`, `config_type`, `is_sensitive`, `description`, `status`) VALUES
('public_domain', 'https://wfr.ccvo.top', 'string', 0, '对外访问域名', 'active'),
('deepseek_api_key', '', 'string', 1, 'DeepSeek API Key（后台保存后不明文展示）', 'active'),
('deepseek_model', 'deepseek-chat', 'string', 0, 'DeepSeek 默认模型', 'active'),
('deepseek_timeout_ms', '5000', 'number', 0, 'DeepSeek 请求超时时间（毫秒）', 'active'),
('risk_system_prompt', '你是 AI小福，一个用于电商平台建站接单场景的客服助手。回复必须适合在闲鱼、淘宝、拼多多等平台内沟通。不得引导客户添加微信、QQ、手机号、邮箱或跳转站外链接。不得承诺违规服务，不得诱导绕过平台规则。表达要专业、简短、自然，优先促成平台内继续沟通。', 'text', 0, '平台内风控系统提示词', 'active'),
('risk_forbidden_words', '["微信","wx","WX","VX","vx","QQ","手机号","电话","加我","私聊","站外","线下交易","绕过平台","规避监管"]', 'json', 0, '默认违禁词列表', 'active'),
('risk_fallback_text', '这个需求可以的，我先根据你描述的功能帮你整理一版建站方案和报价范围，你可以继续在平台里补充行业、页面数量和功能要求，我会帮你细化。', 'text', 0, 'AI 风控或失败时的兜底话术', 'active'),
('api_key_mask', '未配置', 'string', 1, '后台展示时用于标识 DeepSeek Key 状态', 'active');

SET FOREIGN_KEY_CHECKS = 1;
