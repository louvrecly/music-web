import * as React from 'react'
import { connect } from 'react-redux';
import { IRootState, ThunkDispatch } from '../../store';
import { remoteLoadBandAds, remoteLoadMyBand, remoteViewAdModalToggle } from '../../redux/Band/action';
// import { BandAds, Band } from '../../redux/Band/models';
import ViewAdModal from './ViewAdModal';
import { Band, BandAds } from '../../models';
import { smoothScroll } from '../../utils/domControl/domControl';
import "./BandAds.css";

interface IProps {
    myBand: Band | null,
    bandAds: BandAds[],
    loadBandAds: () => void,
    loadMyBand: () => void
    // viewDetailAdModal:(ad:BandAds) => void
    viewAdModal: boolean
    viewAdModalToggle: () => void
}

interface IState {
    bandAds: BandAds | null
}

class JoinABand extends React.Component<IProps, IState> {

    state: IState = {
        bandAds: null
    }

    private viewAdModalToggle = (ad: BandAds, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        this.props.viewAdModalToggle()
        this.setState({ bandAds: ad })
    }

    public componentDidUpdate() {
        const adListScroll = document.querySelector('.adListScroll');
        smoothScroll(adListScroll!, adListScroll!.scrollHeight, "down");
    }

    async componentDidMount() {
        await this.props.loadBandAds()
        await this.props.loadMyBand()
    }

    render() {
        return (

            <div className="col-lg-11 col-md-11 col-sm-11 col-xs-11 joinBand">
                <div className="adListScroll">
                    <div className="force-overflow">
                        <ViewAdModal modal={this.props.viewAdModal} viewAdToggle={this.props.viewAdModalToggle} bandAds={this.state.bandAds!} bandId={this.props.myBand ? this.props.myBand.id : undefined} />
                        <h3 id="joinHeader"> Join a Band</h3>
                        <div className="headRow" id="tag">
                            <div className="tidy">Band</div>
                            <div className="tidy">Headline</div>
                            <div className="tidy">Description</div>
                            <div className="tidy">Message</div>
                            <div className="tidy">Instrument</div>
                            <div className="tidy">Response</div>
                        </div>
                        <div className="dataRow adList" id="adTable">
                            {this.props.bandAds.map(ad => (
                                <div className="row adInformation" key={ad.id}>
                                    <div className="tidy bandName">{ad.bandName}</div>
                                    <div className="tidy adName">{ad.name}</div>
                                    <div className="tidy">{ad.description}</div>
                                    <div className="tidy">{ad.message}</div>
                                    <div className="tidy">{ad.instruments && ad.instruments.replace(/["}{}]/g, "")}</div>
                                    <div className="tidy"><div className="resButton" onClick={this.viewAdModalToggle.bind(this, ad)}>{this.props.myBand && this.props.myBand.id === ad.band_id ? 'Your Ad' : 'View Ad'}</div></div>
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
        bandAds: state.band.bandAds,
        viewAdModal: state.band.viewAdModal
    }
}, (dispatch: ThunkDispatch) => {
    return {
        loadMyBand: () => dispatch(remoteLoadMyBand()),
        loadBandAds: () => dispatch(remoteLoadBandAds()),
        viewAdModalToggle: () => dispatch(remoteViewAdModalToggle())
    }
})(JoinABand);