import React, {Component} from 'react'
<script src="../../scrips/issue-tokens.js" type="text/javascript" async></script> 


class Airdrop extends Component{

	constructor(){
		super()
		this.state = {time: {}, seconds: 20};
		this.timer = 0;
		this.startTimer = this.startTimer.bind(this);
		this.countdown = this.countdown.bind(this);
	}

	startTimer(){
		if(this.timer == 0 && this.state.seconds > 0) {
			this.timer = setInterval(this.countdown, 1000)
		}
	}

	countdown(){
		//Count 1 second at the time
		let seconds = this.state.seconds -1
		this.setState({
			time: this.secondsToTime(seconds),
			seconds: seconds
		})
		//Stop counting when hits 0
		if(seconds == 0) {
			clearInterval(this.timer)

		}
	}

	secondsToTime(secs){
		let hours, minutes, seconds
		hours = Math.floor(secs / (60 *60))

		let devisor_for_minutes = secs % (60 * 60)
		minutes = Math.floor(devisor_for_minutes / 60)

		let devisor_for_seconds = devisor_for_minutes % 60
		seconds = Math.ceil(devisor_for_seconds)

		let obj = {
			'h': hours,
			'm': minutes,
			's': seconds
		}
		return obj
	}

	componentDidMount(){
		let timeLeftVar = this.secondsToTime(this.state.seconds)
		this.setState({time: timeLeftVar})
	}

	airdropReleaseTokens(){
		let stakingB = this.props.stakingBalance
		if(stakingB >= '50000000000000000000'){
			this.startTimer()
			
			
		}
	}

	render(){
		this.airdropReleaseTokens()
		//Airdrop has a timer that counts down
		//initialize after our customer has staked at least 50 tokens
		//timer functionality, countdown, startTimer, state - for time to work
		return(
			<div style={{color:'black'}}>
				{this.state.time.m}:{this.state.time.s}
			</div>
		)
	}
}

export default Airdrop;