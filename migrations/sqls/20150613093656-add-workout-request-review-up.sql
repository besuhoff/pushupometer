DROP TABLE IF EXISTS `request`;
CREATE TABLE `request` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `requestor` varchar(255) NOT NULL,
  `trainee` varchar(255) NOT NULL,
  `amount` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `reason` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_trainee` (`trainee`),
  KEY `idx_trainer` (`requestor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `review`;
CREATE TABLE `review` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `event_type` varchar(255) NOT NULL,
  `event_id` int(10) unsigned NOT NULL,
  `reviewer` varchar(255) NOT NULL,
  `comment` text,
  `date_created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_event_type_event_id` (`event_type`,`event_id`),
  KEY `idx_reviewer` (`reviewer`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `workout`;
CREATE TABLE `workout` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `trainee` varchar(255) NOT NULL,
  `amount` int(11) NOT NULL,
  `proof_url` varchar(2048) DEFAULT NULL,
  `date_created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_trainee` (`trainee`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
