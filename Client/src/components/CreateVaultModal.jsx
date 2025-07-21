import React, { useState } from "react";
import { X, Shield, Lock, Users, HardDrive, CheckCircle } from "lucide-react";
import { initWeb3 } from "../utils/contractInit";
import { toast } from "react-hot-toast";

const CreateVaultModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    storageLimit: "5",
    encryptionLevel: "AES-256",
    accessType: "private",
    autoDeleteDays: "0",
    size: 1024,
    files: 0,
    lastAccessed: Date.now().toString(),
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { web3, contract } = await initWeb3();
      const accounts = await web3.eth.getAccounts();
      await contract.methods
        .createVault(
          formData.name,
          formData.description,
          Number(formData.size),
          formData.encryptionLevel,
          Number(formData.files),
          formData.storageLimit,
          formData.accessType,
          formData.lastAccessed
        )
        .send({ from: accounts[0] });
      toast.success("Vault created on chain!");
      setCurrentStep(4);
    } catch (err) {
      setError(err.message || "Blockchain transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      name: "",
      description: "",
      storageLimit: "5",
      encryptionLevel: "AES-256",
      accessType: "private",
      autoDeleteDays: "0",
      size: 1024,
      files: 0,
      lastAccessed: Date.now().toString(),
    });
    setError("");
    onClose();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Basic Information
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Let&apos;s start with the basics of your new vault
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Vault Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Enter vault name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
          placeholder="Describe what you'll store in this vault"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Storage Limit
        </label>
        <select
          name="storageLimit"
          value={formData.storageLimit}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
        >
          <option value="1">1 GB</option>
          <option value="5">5 GB</option>
          <option value="10">10 GB</option>
          <option value="25">25 GB</option>
          <option value="50">50 GB</option>
          <option value="100">100 GB</option>
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Security Settings
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Configure encryption and access controls
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Encryption Level
        </label>
        <div className="space-y-3">
          <label className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <input
              type="radio"
              name="encryptionLevel"
              value="AES-256"
              checked={formData.encryptionLevel === "AES-256"}
              onChange={handleInputChange}
              className="w-4 h-4 text-cyan-500"
            />
            <div className="ml-3">
              <div className="font-medium text-gray-900 dark:text-white">
                AES-256 (Recommended)
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Military-grade encryption standard
              </div>
            </div>
          </label>
          <label className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <input
              type="radio"
              name="encryptionLevel"
              value="AES-128"
              checked={formData.encryptionLevel === "AES-128"}
              onChange={handleInputChange}
              className="w-4 h-4 text-cyan-500"
            />
            <div className="ml-3">
              <div className="font-medium text-gray-900 dark:text-white">
                AES-128
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Standard encryption for faster processing
              </div>
            </div>
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Access Type
        </label>
        <div className="space-y-3">
          <label className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <input
              type="radio"
              name="accessType"
              value="private"
              checked={formData.accessType === "private"}
              onChange={handleInputChange}
              className="w-4 h-4 text-cyan-500"
            />
            <div className="ml-3 flex items-center">
              <Shield className="h-5 w-5 text-cyan-500 mr-2" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Private
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Only you can access this vault
                </div>
              </div>
            </div>
          </label>
          <label className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <input
              type="radio"
              name="accessType"
              value="shared"
              checked={formData.accessType === "shared"}
              onChange={handleInputChange}
              className="w-4 h-4 text-cyan-500"
            />
            <div className="ml-3 flex items-center">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Shared
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Allow controlled access to others
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Auto-Delete (Optional)
        </label>
        <select
          name="autoDeleteDays"
          value={formData.autoDeleteDays}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
        >
          <option value="0">Never</option>
          <option value="30">30 days</option>
          <option value="90">90 days</option>
          <option value="180">6 months</option>
          <option value="365">1 year</option>
        </select>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Automatically delete vault contents after specified period
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HardDrive className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Review & Create
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Review your vault configuration
        </p>
      </div>
      <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Name:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formData.name}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Storage Limit:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formData.storageLimit} GB
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Encryption:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formData.encryptionLevel}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Access Type:</span>
          <span className="font-medium text-gray-900 dark:text-white capitalize">
            {formData.accessType}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Auto-Delete:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formData.autoDeleteDays === "0"
              ? "Never"
              : `${formData.autoDeleteDays} days`}
          </span>
        </div>
        {formData.description && (
          <div>
            <span className="text-gray-600 dark:text-gray-400">Description:</span>
            <p className="font-medium text-gray-900 dark:text-white mt-1">
              {formData.description}
            </p>
          </div>
        )}
      </div>
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-10 w-10 text-white" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Vault Created Successfully!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your vault &quot;{formData.name}&quot; has been created and is ready to
          use.
        </p>
      </div>
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
        <p className="text-green-700 dark:text-green-400 text-sm">
          🔒 Your vault is secured with {formData.encryptionLevel} encryption and
          is ready for file uploads.
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full border border-gray-200/50 dark:border-gray-700/50 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Vault
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-300"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        {/* Progress Steps */}
        {currentStep < 4 && (
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? "bg-cyan-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      step < currentStep
                        ? "bg-cyan-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>
        {/* Navigation Buttons */}
        <div className="flex justify-between">
          {currentStep === 4 ? (
            <button
              onClick={handleClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Done
            </button>
          ) : (
            <>
              <button
                onClick={currentStep === 1 ? handleClose : handleBack}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300"
              >
                {currentStep === 1 ? "Cancel" : "Back"}
              </button>
              <button
                onClick={currentStep === 3 ? handleSubmit : handleNext}
                disabled={
                  isLoading || (currentStep === 1 && !formData.name.trim())
                }
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>{currentStep === 3 ? "Create Vault" : "Next"}</span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateVaultModal;
