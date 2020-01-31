import React from 'react';
import EditIcon from '@atlaskit/icon/glyph/edit';
import styled from 'styled-components';

export interface EditButtonProps {
  onClick?: (e: React.MouseEvent) => void;
}

interface EditButtonState {
  isMouseEntered: boolean;
}

const Container = styled.div`
  -webkit-app-region: no-drag;
  margin-left: 4px;

  &:hover {
    cursor: pointer;
  }
`;

class EditButton extends React.Component<EditButtonProps, EditButtonState> {

  constructor(props: EditButtonProps) {
    super(props);
    this.state = {
      isMouseEntered: false,
    };
  }

  private handleMouseEnter = (e: React.MouseEvent) => {
    this.setState({
      isMouseEntered: true,
    });
  }

  private handleMouseLeave = (e: React.MouseEvent) => {
    this.setState({
      isMouseEntered: false,
    });
  }

  render() {
    const { isMouseEntered } = this.state;
    const primaryColor = isMouseEntered ? 'black' : '#a0a0a0';
    return (
      <Container
        className="ani-no-drag"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onClick={this.props.onClick}
      >
        <EditIcon primaryColor={primaryColor} label="edit-title" />
      </Container>
    );
  }

}

export default EditButton;
