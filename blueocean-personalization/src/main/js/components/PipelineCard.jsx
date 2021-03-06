/**
 * Created by cmeyers on 6/28/16.
 */
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { Icon } from 'react-material-icons-blue';
import { capable } from '@jenkins-cd/blueocean-core-js';
import { Favorite, LiveStatusIndicator } from '@jenkins-cd/design-language';

const stopProp = (event) => {
    event.stopPropagation();
};

const CAPABILITY_PIPELINE = 'org.jenkinsci.plugins.workflow.job.WorkflowJob';

/**
 * PipelineCard displays an informational card about a Pipeline and its status.
 *
 * Properties:
 * router: instance of RouterContext
 * item: pipeline or branch
 * status: 'result' or 'status' value e.g. 'success', 'failure', etc.
 * estimatedDuration: time in millis over which the progress indicator will update.
 * startTime: ISO-8601 string indicating when tracking of progress begins from.
 * organization: name of org
 * pipeline: name of pipeline
 * branch: name of branch
 * commitId: ID of commit
 * favorite: whether or not the pipeline is favorited
 * onRunClick: callback invoked when 'Run Again' is clicked
 * onFavoriteToggle: callback invokved when favorite checkbox is toggled.
 */
export class PipelineCard extends Component {

    static _getBackgroundClass(status) {
        return status && status.length > 0 ?
            `${status.toLowerCase()}-bg-lite` :
            'unknown-bg-lite';
    }

    constructor(props) {
        super(props);

        this.state = {
            favorite: false,
            stopping: false,
        };
    }

    componentWillMount() {
        this._updateState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this._updateState(nextProps);
    }

    _navigateToRunDetails() {
        const runUrl = `/organizations/${encodeURIComponent(this.props.organization)}/` +
            `${encodeURIComponent(this.props.fullName)}/detail/` +
            `${this.props.branch || this.props.pipeline}/${encodeURIComponent(this.props.runId)}/pipeline`;

        this.props.router.push({
            pathname: runUrl,
        });
    }

    _updateState(props) {
        this.setState({
            favorite: props.favorite,
            stopping: false,
        });
    }

    _onRunClick() {
        if (this.props.onRunClick) {
            this.props.onRunClick(this.props.item);
        }
    }

    _onRunAgainClick() {
        if (this.props.onRunAgainClick) {
            this.props.onRunAgainClick(this.props.item);
        }
    }

    _onStopClick() {
        if (!this.state.stopping) {
            this.setState({
                stopping: true,
            });

            if (this.props.onStopClick) {
                this.props.onStopClick(this.props.item);
            }
        }
    }

    _onFavoriteToggle() {
        const value = !this.state.favorite;
        this.setState({
            favorite: value,
        });

        if (this.props.onFavoriteToggle) {
            this.props.onFavoriteToggle(value);
        }
    }

    render() {
        const { item, status, commitId, startTime, estimatedDuration } = this.props;
        const bgClass = PipelineCard._getBackgroundClass(status);

        const notRunningStatus = !status || (status.toLowerCase() !== 'running' && status.toLowerCase() !== 'queued');
        const hasFailedStatus = status && (status.toLowerCase() === 'failure' || status.toLowerCase() === 'aborted');
        const isPipeline = item && capable(item, CAPABILITY_PIPELINE);
        const stopClass = this.state.stopping ? 'stopping' : '';
        const commitText = commitId ? commitId.substr(0, 7) : '';

        const activityUrl = `/organizations/${encodeURIComponent(this.props.organization)}/` +
        `${encodeURIComponent(this.props.fullName)}/activity`;

        return (
            <div className={`pipeline-card ${bgClass}`} onClick={() => this._navigateToRunDetails()}>
                <LiveStatusIndicator
                  result={status} startTime={startTime} estimatedDuration={estimatedDuration}
                  width={'20px'} height={'20px'} noBackground
                />

                <span className="name">
                    <Link to={activityUrl} onClick={(event) => stopProp(event)}>
                        {this.props.organization} / <span title={this.props.fullName}>{this.props.pipeline}</span>
                    </Link>
                </span>

                { this.props.branch ?
                <span className="branch">
                    <span className="octicon octicon-git-branch"></span>
                    <span className="branchText">{decodeURIComponent(this.props.branch)}</span>
                </span>
                :
                <span className="branch"></span>
                }

                { commitId ?
                <span className="commit">
                    <span className="octicon octicon-git-commit"></span>
                    <pre className="commitId">#{commitText}</pre>
                </span>
                :
                <span className="commit"></span>
                }

                <span className="actions">
                    { hasFailedStatus && isPipeline &&
                    <a className="action-item rerun-button" title="Run Again" onClick={(event) => {stopProp(event); this._onRunAgainClick();}}>
                        <Icon size={24} icon="replay" />
                    </a>
                    }

                    { notRunningStatus &&
                    <a className="action-item run-button" title="Run" onClick={(event) => {stopProp(event); this._onRunClick();}}>
                        <Icon size={24} icon="play_circle_outline" />
                    </a>
                    }

                    { !notRunningStatus &&
                    <a className={`action-item stop-button ${stopClass}`} title="Stop" onClick={(event) => {stopProp(event); this._onStopClick();}}></a>
                    }

                    <Favorite checked={this.state.favorite} className="dark-white"
                      onToggle={() => this._onFavoriteToggle()}
                    />
                </span>
            </div>
        );
    }
}

PipelineCard.propTypes = {
    router: PropTypes.object,
    item: PropTypes.object,
    status: PropTypes.string,
    startTime: PropTypes.string,
    estimatedDuration: PropTypes.number,
    organization: PropTypes.string,
    fullName: PropTypes.string,
    pipeline: PropTypes.string,
    branch: PropTypes.string,
    commitId: PropTypes.string,
    runId: PropTypes.string,
    favorite: PropTypes.bool,
    onRunClick: PropTypes.func,
    onRunAgainClick: PropTypes.func,
    onStopClick: PropTypes.func,
    onFavoriteToggle: PropTypes.func,
};

PipelineCard.defaultProps = {
    favorite: false,
};
