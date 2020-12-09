import * as React from 'react'
import SearchBox from './SearchBox';
import CreateBox from './CreateBox';
import JoinABand from './JoinABand';
import CreatBandModal from './CreateBandModal';
import CreatAdsModal from './CreateAdsModal';
import { IRootState, ThunkDispatch } from '../../store';
import { connect } from 'react-redux';
// ReactHook function
// import { useSelector,useDispatch } from 'react-redux';
// import { useState } from 'react';
import { remoteBandModalToggle, remoteAdModalToggle } from '../../redux/Band/action';
import "./BandAds.css";


interface IBandAdsProps {
    bandModal: boolean
    adModal: boolean 
    viewAdModal: boolean
    bandModalToggle: () => void
    adModalToggle: () => void
    // viewAdModalToggle: () => void
}

class BandAds extends React.Component<IBandAdsProps>{

    private bandToggle = () => {
        this.props.bandModalToggle()
    }

    private adsToggle = () => {
        this.props.adModalToggle()
    }

    public render(){
    return (
        
        <div className="bandContent">
            <CreatBandModal modal={this.props.bandModal} bandToggle={this.bandToggle}/>
            <CreatAdsModal modal={this.props.adModal} adsToggle={this.adsToggle}/>
            <div className='row'>
                <SearchBox />
                <CreateBox bandToggle={this.bandToggle} adsToggle={this.adsToggle}/> 
            </div>
            <div className='row'>
                <JoinABand />
                
                
            </div>
        </div>
        )
    }
}

const mapStateToProps = (state: IRootState) => {
    return {
        bandModal: state.band.bandModal,
        adModal: state.band.adModal
    };
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => {
    return {
        bandModalToggle: () => dispatch(remoteBandModalToggle()),
        adModalToggle: () => dispatch(remoteAdModalToggle())
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(BandAds);



//Chang to ReactHook
// function BandAdsHook(){
//     const { bandModal ,adModal} = useSelector((state:IRootState)=>state.band);

//     const dispatch = useDispatch<ThunkDispatch>();

//     const [counter,setCounter] = useState(0);

//     const bandToggle = ()=>{
//         dispatch(remoteBandModalToggle());
//     }

//     const adsToggle = ()=>{
//         dispatch(remoteAdModalToggle());
//     }

//     return (
        
//         <div className="bandContent">
//             <CreatBandModal modal={bandModal} bandToggle={bandToggle}/>
//             <CreatAdsModal modal={adModal} adsToggle={adsToggle}/>
//             <div className='row'>
//                 <SearchBox />
//                 <CreateBox bandToggle={bandToggle} adsToggle={adsToggle}/> 
//             </div>
//             <div className='row'>
//                 <JoinABand />
                
//             </div>
//         </div>
//         )
// }