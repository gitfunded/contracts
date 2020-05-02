pragma solidity >0.5.0<=0.7.0;

interface iGovernance {

  // function storeValue(uint value) external;
  // function getValues() external view returns(uint);

  function submitProposal(address applicant, uint256 sharesRequested, uint256 lootRequested, uint256 tributeOffered, address tributeToken, 
  						  uint256 paymentRequested, address paymentToken, string calldata details) external returns (uint256 proposalId);
  function sponsorProposal(uint256 proposalId)  external returns (uint256);
  function getProposal ()  external view returns(uint256);
  function getProposalQueueLength() external view returns (uint256);
  function submitVote(uint256 proposalIndex, uint8 uintVote) external;
  function processProposal(uint256 proposalIndex) external;

}

