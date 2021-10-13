import React, {Component} from 'react';
import './App.css';
import Navbar from './Navbar.js';
import Main from './Main.js'
import Web3 from 'web3';
import Tether from '../abis/Tether.json'
import RWD from '../abis/RWD.json'
import DecentralBank from '../abis/DecentralBank.json'
import ParticleSettings from './ParticleSettings.js'

class App extends Component {

	async UNSAFE_componentWillMount(){
		await this.loadWeb3()
		await this.loadBlockchainData()
	}

	async loadWeb3(){
		if(window.ethereum){
			window.web3 = new Web3(window.ethereum)
			await window.ethereum.enable()
		} else if (window.web3){
				window.web3 = new Web3(window.web3.currentProvider)
		} else {
			window.alert('No ethereum browser detected. You can check out Metamask')
		}
	}

	async loadBlockchainData(){
		const web3 = window.web3
		const account = await web3.eth.getAccounts()
		this.setState({account: account[0]})
		const networkId = await web3.eth.net.getId()

		//load thether contract 
		const tetherData = Tether.networks[networkId]
		if(tetherData) {
			const tether = new web3.eth.Contract(Tether.abi, tetherData.address)
			this.setState({tether})
			let tetherBalance = await tether.methods.balanceOf(this.state.account).call()
			this.setState({tetherBalance: tetherBalance.toString() })
		} else {
			window.alert('ERROR. Tether contract not deployed to detected network')
		}
		//Load RWD contract
		const rwdData = RWD.networks[networkId]
		if(rwdData) {
			const rwd = new web3.eth.Contract(RWD.abi, rwdData.address)
			this.setState({rwd})
			let rwdBalance = await rwd.methods.balanceOf(this.state.account).call()
			this.setState({rwdBalance: rwdBalance.toString() })
		} else {
			window.alert('ERROR. RWD contract not deployed to detected network')
		}
		//Load Decentral Bank Data
		const decentralBankData = DecentralBank.networks[networkId]
		if(decentralBankData) {
			const decentralBank = new web3.eth.Contract(DecentralBank.abi, decentralBankData.address)
			this.setState({decentralBank})
			let stakingBalance = await decentralBank.methods.stakingBalance(this.state.account).call()
			this.setState({stakingBalance: stakingBalance.toString()})
		} else {
			window.alert('ERROR. DecentralBank contract not deployed to detected network')
		}

		this.setState({loading: false})
	}

	//Two functions one that stakes and other to Unstake
	//Leverage our decentralBank contract - deposit tokens and unstaking
	//all of this is for staking:
	//deposit tokens (transferFrom)
	//Function aprove transaction hash
	//STAKING FUNCTION >> decentralbank.depositTokens(send transaction hash => )

	//staking function
	stakeTokens = (amount) =>{
		this.setState({loading: true})
		this.state.tether.methods.approve(this.state.decentralBank._address, amount).send({from: this.state.account}).on('transactionHash', (hash) => {
		this.state.decentralBank.methods.depositTokens(amount).send({from: this.state.account}).on('transactionHash', (hash) => {
		this.setState({loading: false})

			})
		})
	}

	//Unstaking function
	unstakeTokens = (amount) =>{
		this.setState({loading: true})
		this.state.decentralBank.methods.unstakeTokens().send({from: this.state.account}).on('transactionHash', (hash) => {
			this.setState({loading: false})
			})
	}


	constructor(props){
		super(props)
		this.state = {
			account: '0x0',
			tether:{},
			rwd: {},
			decentralBank: {},
			tetherBalance: '0',
			rwdBalance: '0',
			stakingBalance: '0',
			loading: true
		}
	}

	//react code goes here
	render(){
		let content
		{this.state.loading ? content =
			<p id='loader' className='text-center' style={{margin: '30px', color:'white'}}>LOADING... Please Wait.</p> :
			 content = <Main
			 	tetherBalance={this.state.tetherBalance}
			 	rwdBalance={this.state.rwdBalance}
			 	stakingBalance={this.state.stakingBalance}
			 	stakeTokens={this.stakeTokens}
			 	unstakeTokens={this.unstakeTokens}

			 />}
		return (
			<div className='App' style={{position: 'relative'}}>

				<div style={{position: 'absolute'}}>
				 <ParticleSettings />
				</div>

				<Navbar account={this.state.account}/>

					<div className='container-fluid mt-5' style={{position: 'relative'}}>
						<div className='row'>
							<main role='main' className='col-lg-12 ml-auto mr-auto' style={{maxWidth:'600px', minHeight: '100vm', }}>
								
							</main>
						</div>
						{content}
					</div>
			</div>
		)
	}
}

export default App;