pragma solidity ^0.5.0;

import './RWD.sol';
import './Tether.sol';

contract DecentralBank{
	address public owner;
	string public name = 'Decentral Bank';
	Tether public tether;
	RWD public rwd;

	address[] public stakers;

	mapping(address => uint) public stakingBalance;
	mapping (address => bool) public hasStaked;
	mapping (address => bool) public isStaking;

	
	

	constructor(RWD _rwd,Tether _tether) public {
		rwd = _rwd;
		tether = _tether;
		owner = msg.sender;
	}

	//Staking function
	function depositTokens(uint _amount) public {
		//require staking amount to be greater than 0 
		require(_amount > 0, 'Amount cannot be 0');


		//transfer tether to this contract address for staking
		tether.transferFrom(msg.sender, address(this), _amount);

		//update staking balance
		stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;
		if(!hasStaked[msg.sender]){
			stakers.push(msg.sender);
		}
		isStaking[msg.sender] = true;
		hasStaked[msg.sender] = true;
	}

	//Unstake token function
	function unstakeTokens() public {
		uint balance = stakingBalance[msg.sender];
		require(balance > 0, 'staking balance cannot be less than 0');

		//transfer the tokens to the specified contact address from our bank
		tether.transfer(msg.sender, balance);

		//reset staking balance
		stakingBalance[msg.sender] = 0;
		//update staking status
		isStaking[msg.sender] = false;
	}

	//issue rewards
	function issueToken() public {
		//require the owner to issue tokens only
		require(msg.sender == owner, 'caller must be the owner');
			for(uint i=0; i < stakers.length; i++){
				address recipient = stakers[i];
				uint balance = stakingBalance[recipient] / 9; //to create incentive percentage

				if(balance > 0){
					rwd.transfer(recipient, balance);
				}
			}
	}
}
