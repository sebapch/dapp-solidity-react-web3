const Tether = artifacts.require('Tether');
const RWD = artifacts.require('RWD');
const DecentralBank = artifacts.require('DecentralBank');

require('chai')
.use(require('chai-as-promised'))
.should()

contract('DecentralBank', ([owner, customer]) => {
	let tether, rwd, decentralBank

	function tokens(number){
		return web3.utils.toWei(number, 'Ether')
	}

	before(async () => {
		tether = await Tether.new()
		rwd = await RWD.new()
		decentralBank = await DecentralBank.new(rwd.address, tether.address)

		//transfer all tokens to decentralBank
		await rwd.transfer(decentralBank.address,tokens('1000000'))

		//transfer 100 tether to the investor
		await tether.transfer(customer, tokens('100'), {from: owner})
	})

	describe('Theter deployment', async () =>{
		it('matches name succesfully', async() =>{
			const name = await tether.name()
			assert.equal(name, 'Tether')
		})
	})


	describe('RWD deployment', async () =>{
		it('matches name succesfully', async() =>{
			const name = await rwd.name()
			assert.equal(name, 'Reward')
		})
	})

	describe('DecentralBank deployment', async () =>{
		it('matches name succesfully', async() =>{
			const name = await decentralBank.name()
			assert.equal(name, 'Decentral Bank')
		})
		it('contract has tokens', async() => {
			let balance = await rwd.balanceOf(decentralBank.address)
			assert.equal(balance, tokens('1000000')) 
		})

		describe('Yield farming', async () => {
			it('Rewards tokens for staking', async () =>{
				let result
				//check investor balance
				result = await tether.balanceOf(customer)
				assert.equal(result.toString(), tokens('100'), 'Customer mock tether balance before staking')
			
				//check staking  for customer
				await tether.approve(decentralBank.address ,tokens('100'), {from: customer})
				await decentralBank.depositTokens(tokens('100'), {from: customer})

				//check updated balance of customer
				result = await tether.balanceOf(customer)
				assert.equal(result.toString(), tokens('0'), 'Customer mock tether balance after transfer')

				//check decentralBank updated balance
				result = await decentralBank.stakingBalance(customer)
				assert.equal(result.toString(), tokens('100'), 'Decentralbank Tokens')

				//is Staking update
				result = await decentralBank.isStaking(customer)
				assert.equal(result.toString(), 'true', 'Customer is staking status to be true') 

				//issue tokens
				await decentralBank.issueToken({from: owner})

				//ensure only the owner can issue tokens
				await decentralBank.issueToken({from: customer}).should.be.rejected;

				// Unstake tokens
				await decentralBank.unstakeTokens({from: customer})

				//check unstaking balances
				result = await tether.balanceOf(customer)
				assert.equal(result.toString(), tokens('100'), 'Customer mock tether balance after unstaking')
			
				//check decentralBank updated balance
				result = await tether.balanceOf(decentralBank.address)
				assert.equal(result.toString(), tokens('0'), 'Decentralbank Tokens after unstaking')

				//Is staking Update
				result = await decentralBank.isStaking(customer)
				assert.equal(result.toString(), 'false', 'Customer is no longer staking status to be false') 

			})
		})
	})
})