// SPDX‑License‑Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VaultContract
 * @notice Users create vaults and register off‑chain files (by IPFS/AR CID).
 *         • Vaults and files are “soft‑deleted” (immutable chain data).
 *         • deleteFile() now properly decrements the vault’s file counter.
 */
contract VaultContract {
    /* ───────── DATA STRUCTURES ───────── */

    struct Vault {
        string   name;
        string   description;
        uint256  size;             // total bytes currently used
        string   encryptionLevel;
        uint256  files;            // active file count  ✅ kept accurate
        string   storageLimit;     // human‑readable (e.g., "5GB")
        string   accessType;       // "Private" | "Public"
        string   lastAccessed;
        address  owner;
        bool     exists;           // soft‑delete flag
    }

    struct File {
        string   cid;              // empty string == deleted
        string   name;
        uint256  size;
        string   mimeType;
        uint256  uploadedAt;       // 0 == deleted
        address  owner;            // address(0) == deleted
    }

    Vault[] public vaults;
    mapping(uint => File[]) private vaultFiles;   // vaultId → files[]
    mapping(address => uint[]) private ownerVaultIds;

    /* ───────── EVENTS ───────── */
    event VaultCreated (uint indexed id, string name, address indexed owner);
    event VaultDeleted (uint indexed id, address indexed owner);
    event FileUploaded (uint indexed vaultId, uint indexed fileIdx, string cid, address indexed uploader);
    event FileDeleted (uint indexed vaultId, uint indexed fileIdx, address indexed deleter);

    /* ───────── VAULT OPERATIONS ───────── */

    function createVault(
        string calldata _name,
        string calldata _description,
        uint256 _size,
        string calldata _encryptionLevel,
        uint256 _files,
        string calldata _storageLimit,
        string calldata _accessType,
        string calldata _lastAccessed
    ) external {
        vaults.push(
            Vault({
                name:            _name,
                description:     _description,
                size:            _size,
                encryptionLevel: _encryptionLevel,
                files:           _files,
                storageLimit:    _storageLimit,
                accessType:      _accessType,
                lastAccessed:    _lastAccessed,
                owner:           msg.sender,
                exists:          true
            })
        );

        uint id = vaults.length - 1;
        ownerVaultIds[msg.sender].push(id);
        emit VaultCreated(id, _name, msg.sender);
    }

    function getVault(uint _id)
        external
        view
        returns (
            string  memory name,
            string  memory description,
            uint256        size,
            string  memory encryptionLevel,
            uint256        files,
            string  memory storageLimit,
            string  memory accessType,
            string  memory lastAccessed,
            address        owner
        )
    {
        require(_id < vaults.length, "Vault does not exist");
        Vault storage v = vaults[_id];
        require(v.exists, "Vault deleted");
        return (
            v.name,
            v.description,
            v.size,
            v.encryptionLevel,
            v.files,
            v.storageLimit,
            v.accessType,
            v.lastAccessed,
            v.owner
        );
    }

    function getVaultCount() external view returns (uint) {
        return vaults.length;
    }

    function getMyVaultIds() external view returns (uint[] memory) {
        return ownerVaultIds[msg.sender];
    }

    function deleteVault(uint _id) external {
        require(_id < vaults.length, "Vault does not exist");
        Vault storage v = vaults[_id];
        require(v.exists, "Vault deleted");
        require(v.owner == msg.sender, "Not owner");
        v.exists = false;
        emit VaultDeleted(_id, msg.sender);
    }

    /* ───────── FILE OPERATIONS ───────── */

    function uploadFile(
        uint    _vaultId,
        string  calldata _cid,
        string  calldata _name,
        uint256 _size,
        string  calldata _mime
    ) external {
        require(_vaultId < vaults.length, "Vault does not exist");
        Vault storage v = vaults[_vaultId];
        require(v.exists, "Vault deleted");
        require(v.owner == msg.sender, "Not owner");

        vaultFiles[_vaultId].push(
            File({
                cid:        _cid,
                name:       _name,
                size:       _size,
                mimeType:   _mime,
                uploadedAt: block.timestamp,
                owner:      msg.sender
            })
        );
        v.files += 1;                                 // increment ✅

        emit FileUploaded(_vaultId, vaultFiles[_vaultId].length - 1, _cid, msg.sender);
    }

    /**
     * @notice Soft‑delete a single file and decrement vault.files counter
     *         only if the file was not already deleted.
     */
    function deleteFile(uint _vaultId, uint _fileIdx) external {
        require(_vaultId < vaults.length, "Vault does not exist");
        Vault storage v = vaults[_vaultId];
        require(v.exists, "Vault deleted");
        require(v.owner == msg.sender, "Not owner");
        require(_fileIdx < vaultFiles[_vaultId].length, "Bad index");

        File storage f = vaultFiles[_vaultId][_fileIdx];
        require(f.owner == msg.sender, "Not file owner");

        // Decrement once (ignore repeat calls)
        if (bytes(f.cid).length > 0 || f.size > 0) {
            v.files -= 1;
        }

        // Soft‑delete: blank out fields
        f.cid        = "";
        f.name       = "";
        f.size       = 0;
        f.mimeType   = "";
        f.uploadedAt = 0;
        f.owner      = address(0);

        emit FileDeleted(_vaultId, _fileIdx, msg.sender);
    }

    function getFile(
        uint _vaultId,
        uint _fileIdx
    )
        external
        view
        returns (
            string  memory cid,
            string  memory name,
            uint256        size,
            string  memory mimeType,
            uint256        uploadedAt,
            address        owner
        )
    {
        require(_vaultId < vaults.length, "Vault does not exist");
        require(_fileIdx < vaultFiles[_vaultId].length, "Bad index");

        File storage f = vaultFiles[_vaultId][_fileIdx];
        return (f.cid, f.name, f.size, f.mimeType, f.uploadedAt, f.owner);
    }

    function getFileCount(uint _vaultId) external view returns (uint) {
        require(_vaultId < vaults.length, "Vault does not exist");
        return vaultFiles[_vaultId].length;
    }
}
