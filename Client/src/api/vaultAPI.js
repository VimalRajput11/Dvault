// src/api/vaultAPI.js
import { initWeb3,getContract } from "../utils/contractInit";
import { uploadFileToIPFS } from "../chain/pinata";

/* ------------------------------------------------------------------ */
/*  Vault‑centric chain API                                           */
/* ------------------------------------------------------------------ */
export const vaultAPI = {
  /* ========== READ VAULT LIST (for dashboard) ========== */
  getVaults: async () => {
    const { contract }    = await initWeb3();
    const [account]       = await window.ethereum.request({ method: "eth_requestAccounts" });
    const ids             = await contract.methods.getMyVaultIds().call({ from: account });
    const data = await Promise.all(ids.map(async (id) => {
      const v = await contract.methods.getVault(id).call();
      return { id, ...v };
    }));
    return { data };
  },

  /* ========== READ SINGLE VAULT (for VaultViewer) ========== */
  getVault: async (vaultId) => {
    const { contract } = await initWeb3();
    const data = await contract.methods.getVault(vaultId).call();
    return { data: { id: vaultId, ...data } };
  },

  /* ========== FILE LIST IN A VAULT ========== */
  /* ========== FILE LIST IN A VAULT ========== */
getFiles: async (vaultId) => {
  await initWeb3(); // 🔥 ensures contract is initialized
  const contract = getContract(); // ✅ now safe to call

  const fileCount = await contract.methods.getFileCount(vaultId).call();
  const files = [];

  for (let i = 0; i < fileCount; i++) {
    const f = await contract.methods.getFile(vaultId, i).call();
    if (f.cid && f.cid !== "") {
      files.push({
        fileIdx: i,
        cid: f.cid,
        name: f.name,
        size: Number(f.size),
        mimeType: f.mimeType,
        uploadDate: new Date(Number(f.uploadedAt) * 1000).toISOString(),
        owner: f.owner,
        type: guessType(f.name),
      });
    }
  }

  return { data: files };
},

  /* ========== UPLOAD ONE FILE ========== */
  uploadFile: async (vaultId, [file], { onUploadProgress } = {}) => {
    // 1) Pinata
    const { cid } = await uploadFileToIPFS(file, onUploadProgress);

    // 2) on‑chain metadata
    const { web3, contract } = await initWeb3();
    const [acct]             = await web3.eth.getAccounts();
    const ext                = file.name.split(".").pop().toLowerCase();
    await contract.methods
      .uploadFile(vaultId, cid, file.name, file.size.toString(), ext)
      .send({ from: acct });
  },

  /* ========== DOWNLOAD FILE (via gateway) ========== */
  downloadFile: async (vaultId, fileIdx, cfg = {}) => {
    const { contract } = await initWeb3();
    const f            = await contract.methods.getFile(vaultId, fileIdx).call();
    const gatewayUrl   = `https://gateway.pinata.cloud/ipfs/${f.cid}`;
    const resp         = await fetch(gatewayUrl);
    const blob         = await resp.blob();
    return { data: blob };
  },

  /* ========== DELETE FILE (on‑chain soft delete) ========== */
  deleteFile: async (vaultId, fileIdx) => {
    const { web3, contract } = await initWeb3();
    const [acct]             = await web3.eth.getAccounts();
    await contract.methods.deleteFile(vaultId, fileIdx).send({ from: acct });
  },
};

/* helpers */
function guessType(str = "") {
  const ext = str.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (["mp4", "avi", "mov", "wmv"].includes(ext))           return "video";
  if (["mp3", "wav", "flac", "aac"].includes(ext))          return "audio";
  if (["zip", "rar", "7z", "tar"].includes(ext))            return "archive";
  if (["pdf", "doc", "docx", "txt", "rtf"].includes(ext))   return "document";
  return "file";
}
