/**
 * Download R6 Siege map cover images from Ubisoft CDN.
 * Converts to WebP (600px wide, quality 85) and saves to uploads/maps/{slug}-cover.webp.
 *
 * Usage: npx tsx src/scripts/download-covers.ts
 */
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const COVERS: Record<string, string> = {
  bank: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/6ilgtuzucX7hEu2MvjhRtp/c7c7e63cff53c8b2192fdec68a736619/R6S_Maps_Bank_EXT.jpg',
  border: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/4hqsrL3cokFqedkfjiEaGf/655acbe5ae4ffab54f742d17f929d2af/R6S_Maps_Border_EXT.jpg',
  chalet: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/Km3ZJUM7ZMVbGsi6gad5Y/5656a6da468b39f5e8effe5307592f28/R6S_Maps_Chalet_EXT.jpg',
  clubhouse: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/1vCw5eD2XzxZlv6Au1gtui/06a84bacaacab62937dd6d4d8ae393c7/R6S_Maps_ClubHouse_EXT.jpg',
  coastline: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/5GfAQ3pXCJnDqiqaDH3Zic/db1722cd699bb864ee8f7b0db951b0c3/r6-maps-coastline.jpg',
  consulate: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/fK2eXk5ne1HUzXkki76qb/54571ed70705051825a70beb2018c5e8/ModernizedMap_Consulate_keyart.jpg',
  kafe: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/2nIuPSHvbM57TK90VSwBEm/c9b6b012d961c03a930902fb14e36ea1/R6S_Maps_RussianCafe_EXT.jpg',
  kanal: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/4VHR8uZRGkHqvtZxtmibtc/da988c2cab37f1cb186535fc9ba40bea/r6-maps-kanal.jpg',
  oregon: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/Z9a0gU7iR0vfcbXtoJUOW/42ad6aabbd189fbcd74c497627f1624e/r6-maps-oregon.jpg',
  house: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/28OaEZAY3stNFr0wSvW9MB/c7acc97d43486349763acab3c1564414/r6-maps-house.jpg',
  villa: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/Io6dxNeHbCbJoF9WLJf9s/ebf89b009affba37df84dcf1934c74e0/r6-maps-villa.jpg',
  skyscraper: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/7vblsbhmSPLsI3pQJ5Dqx9/addc0558833504849fe5ebeafe5fbd5a/skycraper_modernized_keyart.jpg',
  'theme-park': 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/2immPCOZj6tTHMM9zeBg5B/ba237774ba7d2b1e069b6b6065a60207/themepark_modernized_keyart.jpg',
  favela: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/5x991vPOlYbFlynxn9tmn8/96fac98b7b7f7ae54076e0bbcb4dcc42/r6-maps-favela__1_.jpg',
  yacht: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/smDP6lSSaB6Daa7bLZxHZ/d6cc60d76e553e91503a474ff0bc148b/r6-maps-yacht.jpg',
  hereford: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/1QHhMYSliWgWXFLxZj19hz/44197c1d98498d8a77618076a19ce538/r6-maps-hereford.jpg',
  tower: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/6ZMBunxANmzTNr42wwzggb/3a19c506f9e3f910e34da21095686fa9/r6-maps-tower.jpg',
  outback: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/1vqGVW6pqBZlLKp4h86NnB/08a7e337c0cfa604cde79e755fedb397/r6-maps-outback.jpg',
  fortress: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/1MrLwvq61aSSvvUj3dDiZg/58bd501d0064d7b453396bb5a2bd56be/fortress-reworked-thumbnail.jpg',
  plane: 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/3YSN2V0HWsddcQq82Iqihn/d3e03012e8909be26f8274b7f9b3bf19/r6-maps-plane.jpg',
  'nighthaven-labs': 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/57i2PyuzpgVFzOvLUSAItO/97a571fdb6f568ae69951b75f572d361/ModernizedMap_Nighthaven_keyart.jpg',
};

const OUT_DIR = path.resolve(import.meta.dirname, '../../uploads/maps');

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  let success = 0;
  let failed = 0;

  for (const [slug, url] of Object.entries(COVERS)) {
    try {
      console.log(`Downloading ${slug}...`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());

      const outPath = path.join(OUT_DIR, `${slug}-cover.webp`);
      await sharp(buffer)
        .resize(600, null, { withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(outPath);

      console.log(`  -> ${slug}-cover.webp`);
      success++;
    } catch (err) {
      console.error(`  FAILED: ${slug}`, err);
      failed++;
    }
  }

  console.log(`\nDone: ${success} success, ${failed} failed`);
}

main();
