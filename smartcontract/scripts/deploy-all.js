const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Complete Somnia Ecosystem...");
  console.log("==========================================");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));
  
  const deployedContracts = {};
  
  try {
    // 1. Deploy Access Control (needed by other contracts)
    console.log("\n📋 1. Deploying SomniaAccessControl...");
    const SomniaAccessControl = await ethers.getContractFactory("SomniaAccessControl");
    const accessControl = await SomniaAccessControl.deploy();
    await accessControl.waitForDeployment();
    deployedContracts.accessControl = await accessControl.getAddress();
    console.log("✅ SomniaAccessControl deployed to:", deployedContracts.accessControl);
    
    // 2. Deploy Fee Manager
    console.log("\n📋 2. Deploying SomniaFeeManager...");
    const SomniaFeeManager = await ethers.getContractFactory("SomniaFeeManager");
    const feeManager = await SomniaFeeManager.deploy();
    await feeManager.waitForDeployment();
    deployedContracts.feeManager = await feeManager.getAddress();
    console.log("✅ SomniaFeeManager deployed to:", deployedContracts.feeManager);
    
    // 3. Deploy Emergency Controller
    console.log("\n📋 3. Deploying SomniaEmergencyController...");
    const SomniaEmergencyController = await ethers.getContractFactory("SomniaEmergencyController");
    const emergencyController = await SomniaEmergencyController.deploy();
    await emergencyController.waitForDeployment();
    deployedContracts.emergencyController = await emergencyController.getAddress();
    console.log("✅ SomniaEmergencyController deployed to:", deployedContracts.emergencyController);
    
    // 4. Deploy Object Registry (SOM0)
    console.log("\n📋 4. Deploying SomniaObjectRegistry...");
    const SomniaObjectRegistry = await ethers.getContractFactory("SomniaObjectRegistry");
    const objectRegistry = await SomniaObjectRegistry.deploy();
    await objectRegistry.waitForDeployment();
    deployedContracts.objectRegistry = await objectRegistry.getAddress();
    console.log("✅ SomniaObjectRegistry deployed to:", deployedContracts.objectRegistry);
    
    // 5. Deploy Attestation Registry (SOM0)
    console.log("\n📋 5. Deploying SomniaAttestationRegistry...");
    const SomniaAttestationRegistry = await ethers.getContractFactory("SomniaAttestationRegistry");
    const attestationRegistry = await SomniaAttestationRegistry.deploy();
    await attestationRegistry.waitForDeployment();
    deployedContracts.attestationRegistry = await attestationRegistry.getAddress();
    console.log("✅ SomniaAttestationRegistry deployed to:", deployedContracts.attestationRegistry);
    
    // 6. Deploy Experience Registry (SOM1)
    console.log("\n📋 6. Deploying SomniaExperienceRegistry...");
    const SomniaExperienceRegistry = await ethers.getContractFactory("SomniaExperienceRegistry");
    const experienceRegistry = await SomniaExperienceRegistry.deploy();
    await experienceRegistry.waitForDeployment();
    deployedContracts.experienceRegistry = await experienceRegistry.getAddress();
    console.log("✅ SomniaExperienceRegistry deployed to:", deployedContracts.experienceRegistry);
    
    // 7. Deploy Marketplace Adapter
    console.log("\n📋 7. Deploying SomniaMarketplaceAdapter...");
    const SomniaMarketplaceAdapter = await ethers.getContractFactory("SomniaMarketplaceAdapter");
    const marketplaceAdapter = await SomniaMarketplaceAdapter.deploy();
    await marketplaceAdapter.waitForDeployment();
    deployedContracts.marketplaceAdapter = await marketplaceAdapter.getAddress();
    console.log("✅ SomniaMarketplaceAdapter deployed to:", deployedContracts.marketplaceAdapter);
    
    // 8. Deploy Interoperability Bridge
    console.log("\n📋 8. Deploying SomniaInteroperabilityBridge...");
    const SomniaInteroperabilityBridge = await ethers.getContractFactory("SomniaInteroperabilityBridge");
    const interoperabilityBridge = await SomniaInteroperabilityBridge.deploy();
    await interoperabilityBridge.waitForDeployment();
    deployedContracts.interoperabilityBridge = await interoperabilityBridge.getAddress();
    console.log("✅ SomniaInteroperabilityBridge deployed to:", deployedContracts.interoperabilityBridge);
    
    // 9. Deploy Main Asset Router (SOLR)
    console.log("\n📋 9. Deploying SomniaAssetRouter...");
    const SomniaAssetRouter = await ethers.getContractFactory("SomniaAssetRouter");
    const assetRouter = await SomniaAssetRouter.deploy();
    await assetRouter.waitForDeployment();
    deployedContracts.assetRouter = await assetRouter.getAddress();
    console.log("✅ SomniaAssetRouter deployed to:", deployedContracts.assetRouter);
    
    // 10. Initialize contracts with proper configurations
    console.log("\n🔧 Initializing contracts...");
    
    // Set up emergency contacts
    console.log("   - Setting up emergency contacts...");
    await emergencyController.addEmergencyContact(
      deployer.address,
      "Deployer",
      "System Owner",
      4 // Critical level
    );
    
    // Set up fee configurations
    console.log("   - Configuring fee structures...");
    await feeManager.setFeeConfig(0, ethers.parseEther("0.001"), 100, ethers.parseEther("0.0001"), ethers.parseEther("0.01")); // ObjectRegistration
    await feeManager.setFeeConfig(1, ethers.parseEther("0.002"), 100, ethers.parseEther("0.0005"), ethers.parseEther("0.02")); // ExperienceRegistration
    await feeManager.setFeeConfig(2, ethers.parseEther("0.001"), 100, ethers.parseEther("0.0001"), ethers.parseEther("0.01")); // ComponentRegistration
    await feeManager.setFeeConfig(3, ethers.parseEther("0.0005"), 100, ethers.parseEther("0.0001"), ethers.parseEther("0.005")); // AttestationCreation
    await feeManager.setFeeConfig(4, ethers.parseEther("0.005"), 120, ethers.parseEther("0.001"), ethers.parseEther("0.05")); // BridgeOperation
    await feeManager.setFeeConfig(5, ethers.parseEther("0.0025"), 100, ethers.parseEther("0.0005"), ethers.parseEther("0.025")); // MarketplaceTransaction
    await feeManager.setFeeConfig(6, ethers.parseEther("0.0001"), 100, ethers.parseEther("0.00001"), ethers.parseEther("0.001")); // RoutingFee
    
    // Set up distribution configurations
    console.log("   - Configuring revenue distribution...");
    await feeManager.setDistributionConfig(0, 30, address(0)); // Platform
    await feeManager.setDistributionConfig(1, 25, address(0)); // Creator
    await feeManager.setDistributionConfig(2, 15, address(0)); // Attester
    await feeManager.setDistributionConfig(3, 15, address(0)); // ExperienceOwner
    await feeManager.setDistributionConfig(4, 10, address(0)); // ComponentCreator
    await feeManager.setDistributionConfig(5, 5, address(0));  // Treasury
    
    // Set up bridge routes
    console.log("   - Setting up bridge routes...");
    await interoperabilityBridge.createBridgeRoute(
      "somnia-ethereum",
      ["somnia-mainnet", "ethereum-mainnet"],
      [0, 0, 0, 0], // BridgeTypes
      3600 // 1 hour estimated time
    );
    
    await interoperabilityBridge.createBridgeRoute(
      "somnia-polygon",
      ["somnia-mainnet", "polygon-mainnet"],
      [0, 0, 0, 0], // BridgeTypes
      1800 // 30 minutes estimated time
    );
    
    console.log("✅ All contracts initialized successfully!");
    
    // 11. Display deployment summary
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("==========================================");
    console.log("📋 Deployed Contracts:");
    console.log("   • Access Control:", deployedContracts.accessControl);
    console.log("   • Fee Manager:", deployedContracts.feeManager);
    console.log("   • Emergency Controller:", deployedContracts.emergencyController);
    console.log("   • Object Registry:", deployedContracts.objectRegistry);
    console.log("   • Attestation Registry:", deployedContracts.attestationRegistry);
    console.log("   • Experience Registry:", deployedContracts.experienceRegistry);
    console.log("   • Marketplace Adapter:", deployedContracts.marketplaceAdapter);
    console.log("   • Interoperability Bridge:", deployedContracts.interoperabilityBridge);
    console.log("   • Asset Router:", deployedContracts.assetRouter);
    
    console.log("\n🔗 Next Steps:");
    console.log("1. Verify all contracts on Somnia Explorer");
    console.log("2. Update frontend constants with contract addresses");
    console.log("3. Test core functionality (object registration, attestations, etc.)");
    console.log("4. Test emergency controls and recovery mechanisms");
    console.log("5. Test cross-chain bridge functionality");
    console.log("6. Test marketplace operations");
    
    console.log("\n💰 Contract Economics:");
    console.log("   • Object Registration: 0.001 ETH");
    console.log("   • Experience Registration: 0.002 ETH");
    console.log("   • Component Registration: 0.001 ETH");
    console.log("   • Attestation Creation: 0.0005 ETH");
    console.log("   • Bridge Operation: 0.005 ETH");
    console.log("   • Marketplace Transaction: 0.0025 ETH");
    console.log("   • Routing Fee: 0.0001 ETH");
    
    console.log("\n🛡️ Security Features:");
    console.log("   • Role-based access control");
    console.log("   • Emergency pause mechanisms");
    console.log("   • Multi-level emergency contacts");
    console.log("   • Automated recovery plans");
    console.log("   • Fee distribution controls");
    
    return deployedContracts;
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Execute deployment
main()
  .then((contracts) => {
    console.log("\n🎯 Deployment successful!");
    console.log("Contract addresses saved for frontend integration");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  }); 