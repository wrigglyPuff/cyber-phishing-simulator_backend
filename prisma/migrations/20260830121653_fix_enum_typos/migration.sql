/*
  Warnings:

  - The values [RANSONWARE,BUISINESS_EMAIL_COMPROMISE] on the enum `Scenario_category` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Scenario` MODIFY `category` ENUM('PHISHING', 'SMISHING', 'VISHING', 'SOCIAL_ENGINEERING', 'MALWARE', 'RANSOMWARE', 'BUSINESS_EMAIL_COMPROMISE', 'SPEAR_PHISHING', 'WHALING') NOT NULL;
