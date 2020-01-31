import * as React from 'react';
import EditButton from './EditButton';
import CheckIcon from '@atlaskit/icon/glyph/check';
import { produce } from 'immer';

export interface EditableTitleProps {
  // pageKey: string;
  canEdit?: boolean;
  defaultContent?: string;
  onConfirmChange?: (content: string) => void;
}

interface EditableTitleState {
  content: string;
  isEditing: boolean;
  prevCanEdit: boolean;
}

class EditableTitle extends React.Component<EditableTitleProps, EditableTitleState> {

  static getDerivedStateFromProps(props: EditableTitleProps, state: EditableTitleState) {
    return produce(state, (draft: EditableTitleState) => {
      if (!props.canEdit) {
        draft.content = props.defaultContent;
        
        if (draft.prevCanEdit) {
          draft.isEditing = false;
        }
      }

      draft.prevCanEdit = Boolean(props.canEdit);
    });
  }

  constructor(props: EditableTitleProps) {
    super(props);
    this.state = {
      content: props.defaultContent || '',
      isEditing: false,
      prevCanEdit: false,
    };
  }

  private handleEditButtonClicked = (e: React.MouseEvent) => {
    this.setState({
      isEditing: true,
    });
  }
  
  private renderEditIcon() {
    return (
      <EditButton onClick={this.handleEditButtonClicked} />
    );
  }

  private handleInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      content: e.target.value,
    });
  }

  private renderContent() {
    const { isEditing, content } = this.state;
    if (isEditing) {
      return <input value={content} onChange={this.handleInputChanged} />
    }
    return content;
  }

  private confirmInput = () => {
    if (this.props.onConfirmChange) {
      this.props.onConfirmChange(this.state.content);
    }
    this.setState({
      isEditing: false,
    });
  }

  private renderButtonGroups() {
    const { canEdit } = this.props;
    const { isEditing } = this.state;

    if (isEditing) {
      return (
        <div className="ani-confirm-button" onClick={this.confirmInput}>
          <CheckIcon label="check" />
        </div>
      )
    }

    if (canEdit) {
      return this.renderEditIcon();
    }

    return null;
  }

  render() {
    const { isEditing } = this.state;
    let className = 'ani-big-heading noselect';
    if (isEditing) {
      className += ' ani-no-drag';
    }
    return (
      <div className={className}>
        {this.renderContent()}
        {this.renderButtonGroups()}
      </div>
    );
  }

}

export default EditableTitle;
