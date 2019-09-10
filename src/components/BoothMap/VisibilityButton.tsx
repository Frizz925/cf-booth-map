import { faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toggleDisplayCircleName } from '@store/app/actions';
import { AppState } from '@store/app/types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

interface StateToProps {
  visibility: boolean;
}

interface DispatchToProps {
  toggleVisiblity: () => void;
}

type VisiblityButtonProps = StateToProps & DispatchToProps;

const StyledButton = styled.div`
background-color: #5d34af;
color: #fff;
font-size: 18pt;
box-shadow: 1px 1px 3px 1px rgba(0,0,0,0.4);
text-align: center;
cursor: pointer;
position: fixed;
bottom: 12px;
right: 12px;
width: 56px;
height: 56px;
line-height: 56px;
border-radius: 100%;
z-index: 9;
transition: background-color 0.3s;
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
color: #fff;
transition: color 0.3s;
`;

class VisibilityButton extends PureComponent<VisiblityButtonProps> {
  private onClick: () => void;

  constructor(props: VisiblityButtonProps) {
    super(props);
    this.onClick = () => {
      this.props.toggleVisiblity();
    };
  }

  public render() {
    const visibility = !this.props.visibility;
    const buttonStyle = visibility ? {
      backgroundColor: '#fff',
    } : null;
    const iconStyle = visibility ? {
      color: '#5d34af',
    } : null;
    return (
      <StyledButton onClick={this.onClick} style={buttonStyle}>
        <StyledFontAwesomeIcon icon={faEye} style={iconStyle} />
      </StyledButton>
    );
  }
}

const mapStateToProps = (state: AppState): StateToProps => ({
  visibility: state.displayCircleName,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchToProps => ({
  toggleVisiblity() {
    dispatch(toggleDisplayCircleName());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(VisibilityButton);
