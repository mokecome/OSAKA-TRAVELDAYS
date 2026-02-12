const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'osaka-minshuku.db'));
db.pragma('foreign_keys = ON');

// All images extracted from rooms/*.html detail pages
const propertyImages = {
  'yomogi': [
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1543539317236403832/original/8b40bf75-14a9-40dd-98a3-ce0d90847671.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1543539317236403832/original/75236cef-ed2c-42ea-bf3f-062339965889.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1543539317236403832/original/f05683fc-7739-462f-8036-378f8fe41cab.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1543539317236403832/original/7034be21-bf34-4bcf-bc6d-43408d7277e0.jpeg',
  ],
  'juichimei': [
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTM3Mjg5MTI1ODg1MjEyMDU2Ng==/original/2df9c702-2477-45ba-929e-524d8383f7fb.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTM3Mjg5MTI1ODg1MjEyMDU2Ng==/original/08d03803-e276-48e1-b39c-9ae6e4cb8750.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTM3Mjg5MTI1ODg1MjEyMDU2Ng==/original/94d059f8-d0a9-481b-8c02-926c68144075.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTM3Mjg5MTI1ODg1MjEyMDU2Ng==/original/4c1bdd45-14fb-4435-9ba5-407642991272.jpeg',
  ],
  'bunkaen': [
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTI3ODkyNzg2MzY5MzQzODg3Mw%3D%3D/original/7bd428dd-6a09-4916-8ea5-364de7662fbc.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTI3ODkyNzg2MzY5MzQzODg3Mw%3D%3D/original/75cbc05b-4272-475f-bdf5-6ea451ef246b.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTI3ODkyNzg2MzY5MzQzODg3Mw%3D%3D/original/a112d2ff-0db1-4983-af0e-6c19da924ced.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTI3ODkyNzg2MzY5MzQzODg3Mw%3D%3D/original/8b68ab8c-8f13-43c3-85ba-0eca879b2f4a.jpeg',
  ],
  'nk-homes-namba': [
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6Mjg0NDA2Mjg%3D/original/32ebfb0d-cf1c-4c9d-84a4-55bbefd752ac.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/921bedaa-af72-4e2b-baf3-744ce24a410b.jpg?im_w=1200',
    'https://a0.muscache.com/im/pictures/6b1d271f-651c-410a-9d17-6c240bc7a185.jpg?im_w=1200',
    'https://a0.muscache.com/im/pictures/adabac31-7a59-4205-b0b0-69f243268b8e.jpg?im_w=1200',
    'https://a0.muscache.com/im/pictures/44a273f4-afcf-43d6-a3a5-e98de54c617d.jpg?im_w=1200',
    'https://a0.muscache.com/im/pictures/20a3d496-a72e-4b54-b751-06ae80689226.jpg?im_w=1200',
    'https://a0.muscache.com/im/pictures/f1c2495f-02d6-4c94-823c-eeeaac1a6e7b.jpg?im_w=1200',
    'https://a0.muscache.com/im/pictures/70b1cde4-d37c-4a51-8eca-2506b962e1ad.jpg?im_w=1200',
  ],
  'shinsaibashi-family': [
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTM4MDgzMzM%3D/original/8c675e91-f0c4-4165-b7be-15c789a34e2f.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/miso/Hosting-13808333/original/cafd0892-407f-41be-bf3f-3a12a52724e6.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/miso/Hosting-13808333/original/7268c4a4-f3fa-4120-8d31-ceff973c23df.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/e613f4a4-a277-4267-84dc-852fcc0288dc.jpg?im_w=1200',
    'https://a0.muscache.com/im/pictures/ca4cd28b-b5c2-49d8-b78e-89f09c6408fc.jpg?im_w=1200',
    'https://a0.muscache.com/im/pictures/23c867b9-aa2a-4513-a826-d24b3f6faccb.jpg?im_w=1200',
    'https://a0.muscache.com/im/pictures/miso/Hosting-13808333/original/a168d868-f329-4b4f-b296-c92089296f4e.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/5f8f9fb4-baea-4719-9e82-4314449e9f42.jpg?im_w=1200',
  ],
  'nomad-inn': [
    'https://a0.muscache.com/im/pictures/miso/Hosting-1326417920271287072/original/cc4c8b06-db32-41ee-804d-250f31e8b128.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTMyNjQxNzkyMDI3MTI4NzA3Mg==/original/1503b2f0-3043-4bab-92e2-16147b62e544.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTMyNjQxNzkyMDI3MTI4NzA3Mg==/original/af4dc731-3825-4615-b5f8-3c9a419ad418.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTMyNjQxNzkyMDI3MTI4NzA3Mg==/original/9e3f982c-73eb-4b33-86c6-d4c6845fe6fd.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTMyNjQxNzkyMDI3MTI4NzA3Mg==/original/7270f846-e5ac-4aca-8b3e-c787f576e722.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTMyNjQxNzkyMDI3MTI4NzA3Mg==/original/315f9cc5-a29e-442b-ae32-8862fb9e1b4c.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTMyNjQxNzkyMDI3MTI4NzA3Mg%3D%3D/original/5752038c-9191-4545-b6b1-d2fd71e49e32.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTMyNjQxNzkyMDI3MTI4NzA3Mg%3D%3D/original/7ba48fd4-3769-45d7-8dcc-16b1ae5f1072.jpeg?im_w=1200',
  ],
  'geisha': [
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcxNTk1NzM1NTAwMzMyNw==/original/237464a1-4121-4b42-a793-8b7475f26388.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcxNTk1NzM1NTAwMzMyNw==/original/60b986dd-48c8-43f0-a5a6-340411629b51.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcxNTk1NzM1NTAwMzMyNw==/original/fc3d94f4-b28e-4956-bfa1-36e6e77df2b7.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcxNTk1NzM1NTAwMzMyNw==/original/4cfb711a-6dc8-45fc-9c19-f45e32666386.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcxNTk1NzM1NTAwMzMyNw==/original/4fe834f4-684c-426f-a6ad-73042cf406de.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/miso/Hosting-1462715957355003327/original/19deb7ab-7905-4bfa-87c3-e5ad1068e8b9.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcxNTk1NzM1NTAwMzMyNw==/original/58cfdd87-85cc-4f13-b868-f9ea199184ab.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/miso/Hosting-1462715957355003327/original/17e2bf85-ba5a-4c65-a9d5-68ed16b11847.jpeg?im_w=1200',
  ],
  'sakuragawa-nishikujo': [
    'https://a0.muscache.com/im/pictures/miso/Hosting-42631189/original/364206ee-096b-4c4f-8050-4417b9e82580.png?im_w=1200',
    'https://a0.muscache.com/im/pictures/miso/Hosting-42631189/original/d830bb0d-038c-49b2-a19b-b0b2be114a0b.png?im_w=1200',
    'https://a0.muscache.com/im/pictures/b21a45ae-a026-4c4e-a9e2-b676b419ba7d.jpg?im_w=1200',
    'https://a0.muscache.com/im/pictures/911509d3-b888-4dee-b361-a0b9a1533bda.jpg?im_w=1200',
    'https://a0.muscache.com/im/pictures/374af20d-ddff-4164-8f9c-1c0d15193543.jpg?im_w=1200',
    'https://a0.muscache.com/im/pictures/346600f7-8bda-443e-8b18-b8903df79467.jpg?im_w=1200',
    'https://a0.muscache.com/im/pictures/b4c309a2-23af-439a-ab26-6e5db9e3d6fe.jpg?im_w=1200',
    'https://a0.muscache.com/im/pictures/2971181e-b7d0-4e41-976b-a000f35a2ef7.jpg?im_w=1200',
  ],
  'taixiang-2f': [
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcwMjU1OTM4MDMxOTcyMQ==/original/600a04f5-ad46-4703-be41-71debea597f4.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcwMjU1OTM4MDMxOTcyMQ==/original/5ee1133c-d8a9-4c9a-a604-2923dd8b8e27.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcwMjU1OTM4MDMxOTcyMQ==/original/d1a63dc1-a1f9-45fa-8f73-50dc081105a0.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcwMjU1OTM4MDMxOTcyMQ==/original/bb529c92-e6ba-45e7-871b-8acb8832d82a.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcwMjU1OTM4MDMxOTcyMQ==/original/ecd05478-94f6-476c-834d-fccd039f3a9f.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcwMjU1OTM4MDMxOTcyMQ==/original/475e724b-286b-4c18-886c-5099c3714e9a.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcwMjU1OTM4MDMxOTcyMQ==/original/906c14d7-7ecf-4143-87d3-b9e6abd44cb0.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcwMjU1OTM4MDMxOTcyMQ==/original/16f0977d-0b3a-42f9-94e8-b1d97220e09b.jpeg?im_w=1200',
  ],
  'taixiang-3f': [
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcxMTQwNDk4MzU0NDMzNg==/original/1a21ce8e-edf4-4381-8807-2be00d836a5b.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcxMTQwNDk4MzU0NDMzNg==/original/dbb6ba4d-df3b-4d72-92f3-30d4ebd237f1.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcxMTQwNDk4MzU0NDMzNg==/original/b4c381a2-54da-4b2c-9b75-98abfe26bed7.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcxMTQwNDk4MzU0NDMzNg==/original/1cb3afd9-74cc-4e01-a0ca-fb30c2cd2400.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcxMTQwNDk4MzU0NDMzNg==/original/efa12dee-b63b-4de2-86fa-3051d7b8959b.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcxMTQwNDk4MzU0NDMzNg==/original/e1d80940-47ea-4abf-9925-1c7455914cff.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcxMTQwNDk4MzU0NDMzNg==/original/c1f99e0c-6909-48da-9d0f-8298b4a57350.jpeg?im_w=1200',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2MjcxMTQwNDk4MzU0NDMzNg==/original/1571a421-d356-48bc-b276-df73c8af03bc.jpeg?im_w=1200',
  ],
};

const deleteImgs = db.prepare('DELETE FROM property_images WHERE propertyId = ?');
const insertImg = db.prepare('INSERT INTO property_images (propertyId, url, isLocal, filename, sortOrder) VALUES (?,?,?,?,?)');

const update = db.transaction(() => {
  let total = 0;
  for (const [propId, images] of Object.entries(propertyImages)) {
    deleteImgs.run(propId);
    images.forEach((url, i) => {
      insertImg.run(propId, url, 0, '', i);
    });
    total += images.length;
    console.log(`  ${propId}: ${images.length} images`);
  }
  return total;
});

const total = update();
console.log(`\nDone! Updated ${Object.keys(propertyImages).length} properties with ${total} total images.`);
db.close();
