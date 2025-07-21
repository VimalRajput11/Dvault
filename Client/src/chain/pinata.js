import axios from "axios";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export const uploadFileToIPFS = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

  return {
    cid: res.data.IpfsHash,
    size: file.size,
    name: file.name,
  };
};
