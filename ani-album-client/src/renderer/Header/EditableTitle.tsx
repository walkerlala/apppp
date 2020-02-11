import * as React from 'react';
import EditButton from './EditButton';
import CheckIcon from '@atlaskit/icon/glyph/check';
import EditorCloseIcon from '@atlaskit/icon/glyph/editor/close';
import { BigHeadingTitle } from './styles';

export interface EditableTitleProps {
  // pageKey: string;
  canEdit?: boolean;
  showEditButton?: boolean;
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
    const draft: EditableTitleState = {...state};
    if (!props.canEdit) {
      draft.content = props.defaultContent;
      
      if (draft.prevCanEdit) {
        draft.isEditing = false;
      }
    }

    draft.prevCanEdit = Boolean(props.canEdit);

    if (!draft.isEditing) {
      draft.content = props.defaultContent;
    }
    return draft;
  }

  private __inputRef = React.createRef<HTMLInputElement>();

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
    }, () => {
      this.focusInput();
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
      return (
        <input
          className="ani-input"
          value={content}
          onChange={this.handleInputChanged}
          ref={this.__inputRef}
        />
      );
    }
    return content;
  }

  private focusInput() {
    if (!this.__inputRef.current) {
      return;
    }
    this.__inputRef.current.focus();
  }

  private confirmInput = () => {
    let { content } = this.state;

    if (content.length === 0) {
      content = 'Untitled Album';
    }
    // } else if (content.length >= 16) {
    //   content = content.slice(0, 16);
    // }

    if (this.props.onConfirmChange) {
      this.props.onConfirmChange(content);
    }
    this.setState({
      isEditing: false,
    });
  }

  private handleCancelInput = () => {
    this.setState({
      content: this.props.defaultContent || '',
      isEditing: false,
    });
  }

  private renderButtonGroups() {
    const { canEdit, showEditButton } = this.props;
    const { isEditing } = this.state;

    if (isEditing) {
      return (
        <React.Fragment>
          <div className="ani-confirm-button" onClick={this.confirmInput}>
            <CheckIcon label="check" />
          </div>
          <div className="ani-confirm-button" onClick={this.handleCancelInput}>
            <EditorCloseIcon label="cross" />
          </div>
        </React.Fragment>
      );
    }

    if (canEdit && showEditButton) {
      return this.renderEditIcon();
    }

    return null;
  }

  render() {
    const { isEditing } = this.state;
    let className = 'noselect';
    if (isEditing) {
      className += ' ani-no-drag';
    }
    return (
      <BigHeadingTitle className={className}>
        {this.renderContent()}
        {this.renderButtonGroups()}
      </BigHeadingTitle>
    );
  }

}

export default EditableTitle;
