pragma solidity >0.5.0<=0.7.0;

interface iBountiesMetaTxRelayer {

  // function storeValue(uint value) external;
  // function getValues() external view returns(uint);

 function metaIssueBounty(
    bytes calldata signature,
    address payable[] calldata _issuers,
    address[] calldata _approvers,
    string calldata _data,
    uint _deadline,
    address _token,
    uint _tokenVersion,
    uint _nonce)
    external
    returns (uint);

    function metaIssueAndContribute(
    bytes calldata signature,
    address payable[] calldata _issuers,
    address[] calldata _approvers,
    string calldata _data,
    uint _deadline,
    address _token,
    uint _tokenVersion,
    uint _depositAmount,
    uint _nonce)
    external
    payable
    returns (uint);

      function metaContribute(
    bytes calldata _signature,
    uint _bountyId,
    uint _amount,
    uint _nonce)
    external
    payable;

      function metaRefundContribution(
    bytes calldata _signature,
    uint _bountyId,
    uint _contributionId,
    uint _nonce)
    external;

      function metaRefundMyContributions(
    bytes calldata _signature,
    uint _bountyId,
    uint[] calldata _contributionIds,
    uint _nonce)
    external;

      function metaRefundContributions(
    bytes calldata _signature,
    uint _bountyId,
    uint _issuerId,
    uint[] calldata _contributionIds,
    uint _nonce)
    external;

      function metaDrainBounty(
    bytes calldata _signature,
    uint _bountyId,
    uint _issuerId,
    uint[] calldata _amounts,
    uint _nonce)
    external;

      function metaPerformAction(
    bytes calldata _signature,
    uint _bountyId,
    string calldata _data,
    uint256 _nonce)
    external;

      function metaFulfillBounty(
    bytes calldata _signature,
    uint _bountyId,
    address payable[] calldata  _fulfillers,
    string calldata _data,
    uint256 _nonce)
    external;

      function metaUpdateFulfillment(
    bytes calldata _signature,
    uint _bountyId,
    uint _fulfillmentId,
    address payable[] calldata  _fulfillers,
    string calldata _data,
    uint256 _nonce)
    external;

      function metaAcceptFulfillment(
    bytes calldata _signature,
    uint _bountyId,
    uint _fulfillmentId,
    uint _approverId,
    uint[] calldata _tokenAmounts,
    uint256 _nonce)
    external;

      function metaFulfillAndAccept(
    bytes calldata _signature,
    uint _bountyId,
    address payable[] calldata _fulfillers,
    string calldata _data,
    uint _approverId,
    uint[] calldata _tokenAmounts,
    uint256 _nonce)
    external;

      function metaChangeBounty(
    bytes calldata _signature,
    uint _bountyId,
    uint _issuerId,
    address payable[] calldata _issuers,
    address payable[] calldata _approvers,
    string calldata _data,
    uint _deadline,
    uint256 _nonce)
    external;

      function metaAddApprovers(
    bytes calldata _signature,
    uint _bountyId,
    uint _issuerId,
    address[] calldata _approvers,
    uint256 _nonce)
    external;

      function metaAddIssuers(
    bytes calldata _signature,
    uint _bountyId,
    uint _issuerId,
    address payable[] calldata _issuers,
    uint256 _nonce)
    external;

      function metaChangeDeadline(
    bytes calldata _signature,
    uint _bountyId,
    uint _issuerId,
    uint  _deadline,
    uint256 _nonce)
    external;

      function metaChangeData(
    bytes calldata _signature,
    uint _bountyId,
    uint _issuerId,
    string calldata _data,
    uint256 _nonce)
    external;

      function metaChangeApprover(
    bytes calldata _signature,
    uint _bountyId,
    uint _issuerId,
    uint _approverId,
    address payable _approver,
    uint256 _nonce)
    external;

      function metaChangeIssuer(
    bytes calldata _signature,
    uint _bountyId,
    uint _issuerId,
    uint _issuerIdToChange,
    address payable _newIssuer,
    uint256 _nonce)
    external;





}