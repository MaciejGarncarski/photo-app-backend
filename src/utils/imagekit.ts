import ImageKit from 'imagekit';

export const imageKit = new ImageKit({
  publicKey: process.env.IMG_KIT_PUBLIC || '',
  privateKey: process.env.IMG_KIT_PRIVATE || '',
  urlEndpoint: process.env.IMG_KIT_ENDPOINT || '',
});
