import * as React from 'react'
// import { Band, AdResponse } from '../../redux/Band/models';
import { connect } from 'react-redux';
import { IRootState, ThunkDispatch } from '../../store';
import { remoteLoadMyBand, remoteJoinedBands, remoteKickMember, remoteQuitBand, remoteAcceptBandAd, remoteDeclineBandAd, remoteEditBand, remoteEditBandToggle } from '../../redux/Band/action';
import { Member } from '../../redux/Band/state';
import { Band, AdResponse } from '../../models';
import { smoothScroll } from '../../utils/domControl/domControl';
import { FiEdit } from "react-icons/fi";
import EditModal from './EditModal';
import "./MyBand.css";


// interface State {
//     myBand: Band | null,
//     myBandMembers: Member[],
//     joinedBands: Band[]
//     adsResponse: AdResponse[]
// }

interface IProps {
    myBand: Band | null,
    myBandMembers: Member[],
    joinedBands: Band[]
    adsResponse: AdResponse[],
    editModal: boolean,
    loadMyBand: () => void;
    editMyBand: (bandId: number, bandName: string, band_img: string) => void;
    editModalToggle: () => void
    // loadBandMembers: (id:number) => void;
    loadJoinedBands: () => void;
    kickMember: (bandId: number, memberId: number) => void
    quitBand: (bandId: number) => void
    acceptBandAd: (resId: number, bandId: number, playerId: number, playerName: string) => void
    declineBandAd: (resId: number) => void
    // loadAdsResponse: (id:number) => void;
}

class MyBand extends React.Component<IProps> {

    async componentDidMount() {
        await this.props.loadMyBand()
        await this.props.loadJoinedBands()
        // if (this.props.myBand !==null && this.props.myBand.id !== undefined){
        // this.props.loadBandMembers(this.props.myBand.id)
        // this.props.loadAdsResponse(this.props.myBand.id)
        // }
    }

    public componentDidUpdate() {
        const myBandListScroll = document.querySelector('.myBandListScroll');
        smoothScroll(myBandListScroll!, myBandListScroll!.scrollHeight, "down");
    }

    private editMyBand = (bandId: number, bandName: string, band_img: string) => {
        this.props.editMyBand(bandId, bandName, band_img)
    }

    private editModalToggle = () => {
        this.props.editModalToggle();
    }

    private kickMember = (bandId: number, memberId: number) => {
        this.props.kickMember(bandId, memberId)
    }

    private quitBand = (bandId: number) => {
        this.props.quitBand(bandId)
    }

    private acceptBandAd = (resId: number, bandId: number, playerId: number, playerName: string) => {
        this.props.acceptBandAd(resId, bandId, playerId, playerName)
    }

    private declineBandAd = (resId: number) => {
        this.props.declineBandAd(resId)
    }

    render() {
        return (

            <div className="col-lg-7 col-md-7 col-sm-11 col-xs-11 bandStudio">
                <EditModal modal={this.props.editModal} editToggle={this.editModalToggle}/>
                <h3>My Band</h3>
                <div className="row">
                    <div className="col-8 myBandList">
                        <div className="myBandListScroll">
                            <div className="force-overflow">
                                <h5>Manage my band {this.props.myBand && <FiEdit onClick={this.editModalToggle.bind(this, this.props.myBand)}></FiEdit>}</h5>
                                <div className="mainHeadRow">
                                    <div className="tidy">Member</div>
                                    <div className="tidy">Action</div>
                                </div>
                                <div className="dataRow bandList" key="memberTable">
                                    {this.props.myBand && 'id' in this.props.myBand! ? this.props.myBandMembers.filter(
                                        member => member.id !== (this.props.myBand as Band).id).map(member => (
                                            <div className="row memberInformation" key={member.id}>
                                                <div className="tidy memberName" key={member.id}>{member.name}</div>
                                                <div className="tidy"><div className="resButton" key={member.id} onClick={this.kickMember.bind(this, this.props.myBand!.id!, member.id)}>Kick</div></div>
                                            </div>)) : <div className="tidy">You do not own a band</div>}
                                </div>
                            </div>
                        </div>
                        <h5>Ad Response</h5>
                        <div className="mainHeadRow">
                                <div className="tidy">Applicant</div>
                                <div className="tidy">Message</div>
                                <div className="tidy">Action</div>
                        </div>
                        <div className="dataRow resList" id="resTable">
                            <div className="force-overflow">
                            {this.props.adsResponse
                                .filter(ad => ad.status === 'requesting')
                                .map((ad, i) => (
                                    <div className="row resInformation" key={i}>
                                        <div className="tidy applicantName">{ad.name}</div>
                                        <div className="tidy msg">{ad.message}</div>
                                        <div className="tidy showButton">
                                            <div className="resButton" onClick={this.acceptBandAd.bind(this, ad.resId!, this.props.myBand!.id!, ad.playerId, ad.name!)}>approve</div>
                                            <div className="resButton" onClick={this.declineBandAd.bind(this, ad.resId!)}>decline</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="col-4">
                        <h5>Joined Bands</h5>
                        <div className="mainHeadRow">
                            <div className="tidy">Band</div>
                            <div className="tidy">Action</div>
                        </div>
                        <div className="dataRow" id="bandsTable">
                            {this.props.joinedBands && this.props.joinedBands.map(band => (
                                <div className="row bandInformation" key={band.id}>
                                    <div className="tidy bandName">{band.name}</div>
                                    <div className="resButton tidy" onClick={this.quitBand.bind(this, band.id!)}>Quit</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default connect((state: IRootState) => {
    return {
        myBand: state.band.myBand,
        myBandMembers: state.band.myBandMembers,
        joinedBands: state.band.joinedBands,
        adsResponse: state.band.adsResponse,
        editModal: state.band.editModal
    }
}, (dispatch: ThunkDispatch) => {
    return {
        loadMyBand: () => dispatch(remoteLoadMyBand()),
        editMyBand: (bandId: number, bandName: string, band_img: string) => dispatch(remoteEditBand(bandId, bandName, band_img)),
        editModalToggle: () => dispatch(remoteEditBandToggle()),
        // loadBandMembers: (id:number)=> dispatch(reomoteLoadBandMembers(id))
        // loadAdsResponse: (id:number)=> dispatch(reomoteAdsResponse(id)),
        loadJoinedBands: () => dispatch(remoteJoinedBands()),
        kickMember: (bandId: number, memberId: number) => dispatch(remoteKickMember(bandId, memberId)),
        quitBand: (bandId: number) => dispatch(remoteQuitBand(bandId)),
        acceptBandAd: (resId: number, bandId: number, playerId: number, playerName: string) => dispatch(remoteAcceptBandAd(resId, bandId, playerId, playerName)),
        declineBandAd: (bandId: number) => dispatch(remoteDeclineBandAd(bandId))
    }
})(MyBand);