
CREATE TABLE `projects` (
  `id` varchar(50) NOT NULL,
  `private_id` varchar(50) NOT NULL,
  `data` text NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

