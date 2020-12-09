import * as React from 'react'
import { connect } from 'react-redux';
import { IRootState, ThunkDispatch } from '../../store';
import { remoteLoadMyMidis } from '../../redux/Band/action';
import { FacebookShareButton, FacebookIcon, EmailShareButton, EmailIcon, TwitterShareButton, TwitterIcon } from 'react-share';
import "./MyBand.css";
import { Midi } from '../../models';



interface IProps {
    myMidis: Array<Midi>
    loadMyMidis: () => void
}

class MyMidi extends React.Component<IProps> {

    async componentDidMount() {
        await this.props.loadMyMidis()

    }

    render() {
        return (
            <div className="col-lg-5 col-md-5 col-sm-11 col-xs-11 myMidi">
                <h3>My Midi</h3>
                <div className="mainHeadRow">
                    <div className="tidy">Track</div>
                    <div className="tidy">Band</div>
                    <div className="tidy">Share</div>
                </div>
                <div className="dataRow midiList">
                    {this.props.myMidis.map((midi, i) => (
                        <div className="row midiData" key={i}>
                            <div className="tidy midiName">{midi.name}</div>
                            <div className="tidy midiName">{midi.band_name}</div>
                            <div className="tidy shareButton">
                                <FacebookShareButton url={midi.src} quote={midi.name}>
                                    <FacebookIcon size={32} round />
                                </FacebookShareButton>
                                <TwitterShareButton url={midi.src} title={midi.name}>
                                    <TwitterIcon size={32} round />
                                </TwitterShareButton>
                                <EmailShareButton url={midi.src} body="I have fun on Tecky's showcase" subject={`My awesome music - ${midi.name}`}>
                                    <EmailIcon size={32} round />
                                </EmailShareButton>
                            </div>
                        </div>
                    ))}
                </div>
                {/* <div className="Demo__container">
                    <div className="Demo__some-network">
                        <FacebookShareButton
                            url={shareUrl}
                            quote={title}>
                            <FacebookIcon
                                size={32}
                                round />
                        </FacebookShareButton>

                        <FacebookShareCount
                            url={shareUrl}
                            className="Demo__some-network__share-count">
                            {count => count}
                        </FacebookShareCount>
                    </div>
                </div> */}
            </div>
        )
    }
}

export default connect((state: IRootState) => {
    return {
        myMidis: state.band.myMidis
    }
}, (dispatch: ThunkDispatch) => {
    return {
        loadMyMidis: () => dispatch(remoteLoadMyMidis())
    }
})(MyMidi);