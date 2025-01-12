import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import AddIcon from 'material-ui/svg-icons/content/add';
import CourseCard from './CourseCard';
import Parser from './ParseCourses';
import SearchBar from '../SearchBar';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { DragTypes } from 'constants/DragTypes';
import { objectEquals, arrayOfObjectEquals } from 'utils/arrays';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import DeviceOrientation, { Orientation } from 'react-screen-orientation'

import {
  purple,
  lightPurple,
  lightGreen
} from 'constants/Colours';

const space = 8;
const stylesConst = {
  height: 'auto',
  width: 200,
};
const styles = {
  board: (isCart) => ({
    margin: 10,
    width:  stylesConst.width,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: (isCart) ? 450 : 'none',
  }),
  header: (isDragging) => ({
    padding: '5px 0',
    backgroundColor: isDragging ? lightPurple : purple,
    color: 'white',
    fontSize: 18,
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    display: 'flex',
  }),
  responsiveDialog: {
    width: 'fit-content'
  },
  box: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardTitle: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
  },
  level: {
    fontSize: 14,
    marginTop: 3,
  },
  editIcon: {
    color: 'white',
    marginLeft: 'auto'
  },
  listContainer: (isCart) => ({
    margin: '6px 0',
    overflowY: (isCart) ? 'auto' : 'none',
  }),
  addCourseCard: {
    border: '1px dashed #bcbcbc',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
    height: 'auto',
  },
  addIcon: {
    width: 40,
    height: 40,
    cursor: 'pointer',
  }
};

const getListStyle = (isDraggingOver) => ({
  padding: space,
  width: stylesConst.width - space * 2,
  maxHeight: '100%',
  height: stylesConst.height,
  background: isDraggingOver ? lightGreen : 'inherit',
});

const AddCourseCard = ({ onClick }) => (
  <FlatButton style={ styles.addCourseCard } onClick={ onClick } >
    <div style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
      <AddIcon style={ styles.addIcon } />
    </div>
  </FlatButton>
);

AddCourseCard.propTypes = {
  onClick: PropTypes.func.isRequired,
};

const renderCourses = (showAdd, isEditing, courseList, onClick, highlightBackground) => {
  const courses = courseList.map((course, index) => {
    if (course == null) return null; // Not sure why it would be null, but err was thrown
    const key = `${course.subject}/${course.catalogNumber}/${index}`;
    return (
      <Draggable
        key={ key }
        draggableId={ key }
        index={ index }
        type={ DragTypes.COURSE }
        isDragDisabled={ !isEditing }
      >
        { (provided, snapshot) => (
          <CourseCard
            course={ course }
            provided={ provided }
            snapshot={ snapshot }
            highlightBackground={ highlightBackground }
          />
        ) }
      </Draggable>
    );
  });
  // Add "Add courses" button if not a cart and editing mode is on
  if (showAdd && isEditing) courses.push(<AddCourseCard key='add-course' onClick={ onClick } />);
  return courses;
};

export default class TermBoard extends Component {

  static propTypes = {
    index: PropTypes.string,
    term: PropTypes.string,
    level: PropTypes.string,
    courses: PropTypes.array,
    provided: PropTypes.object,
    snapshot: PropTypes.object,
    isEditing: PropTypes.bool.isRequired,
    isCart: PropTypes.bool,
    onRenameBoard: PropTypes.func,
    onAddCourses: PropTypes.func,
    onDeleteBoard: PropTypes.func,
    onClearBoard: PropTypes.func.isRequired,
  };

  static defaultProps = {
    index: '',
    term: '',
    level: '1A',
    courses: [],
    provided: {},
    snapshot: {},
    isCart: false,
    onAddCourses: () => null,
    onRenameBoard: () => null,
  };

  state = {
    renameDialogOpen: false,
    importDialogOpen: false,
    addDialogOpen: false,
    rotationDialogOpen: false,
    settingsOpen: false,
    relevel: this.props.level,
    reterm: this.props.term,
    renameError: '',
    importText: ''
  };

  componentWillReceiveProps(nextProps) {
    const { level, term } = nextProps;
    if (level !== this.state.relevel || term !== this.state.reterm) {
      this.setState({ relevel: level, reterm: term });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { index, term, level, courses, isEditing, provided, snapshot } = nextProps;
    const indexChanged = this.props.index !== index;
    const termChanged = this.props.term !== term;
    const levelChanged = this.props.level !== level;
    const coursesChanged = !arrayOfObjectEquals(courses, this.props.courses);
    const editingChanged = this.props.isEditing !== isEditing;
    const providedChanged = !objectEquals(this.props.provided, provided);
    const snapshotChanged = !objectEquals(this.props.snapshot, snapshot);
    const stateChanged = !objectEquals(this.state, nextState);

    return indexChanged || termChanged || levelChanged
      || coursesChanged || editingChanged || providedChanged
      || snapshotChanged || stateChanged;
  }

  toggleSettings = (open) => this.setState({ settingsOpen: open });

  openRenameDialog = () => this.setState({ settingsOpen: false, renameDialogOpen: true });
  openImportDialog = () => this.setState({ settingsOpen: false, importDialogOpen: true });
  openAddDialog = () => this.setState({ settingsOpen: false, addDialogOpen: true });
  openRotationDialog = () => this.setState({ rotationDialogOpen: true });

  closeRenameDialog = () => this.setState({ reterm: this.props.term, renameError: '', renameDialogOpen: false });
  closeImportDialog = () => this.setState({ importDialogOpen: false });
  closeAddDialog = () => this.setState({ addDialogOpen: false });
  closeRotationDialog = () => this.setState({ rotationDialogOpen: false });

  onChangeRenameText = (e, reterm) => this.setState({ reterm, renameError: '' });
  onChangeRelevel = (ev, index, relevel) => this.setState({ relevel });
  onChangeImportText = (importText) => this.setState({ importText });

  onRename = () => {
    const { reterm, relevel } = this.state;
    if (reterm.length === 0) {
      this.setState({ renameError: 'Field cannot be left blank' });
      return;
    }
    this.props.onRenameBoard(reterm, relevel);
    this.setState({ renameError: '', renameDialogOpen: false });
  }

  onImport = () => {
    const { importText } = this.state;
    this.closeImportDialog();

    fetch('/server/parse/courses', {
      method: 'POST',
      body: JSON.stringify({ text: importText }),
      headers: {
        'content-type': 'application/json',
        'x-secret': process.env.REACT_APP_SERVER_SECRET
      }
    }).then(response => {
      if (!response.ok) throw new Error(`status ${response.status}`);
      else return response.json();
    }).then((termCourses) => {
      this.setState({ importing: false });
      const { courses } = termCourses;
      this.props.onAddCourses(courses);
    }).catch(err => toast.error(`Failed to parse your courses. Error: ${err.message}`));
  }

  onSearchResult = ({ subject, catalogNumber }) => {
    this.props.onAddCourses([{ subject, catalogNumber }])
    this.closeAddDialog();
  }

  clearBoard = () => {
    this.props.onClearBoard();
    this.toggleSettings(false);
  }

  deleteBoard = () => {
    this.props.onDeleteBoard();
    this.toggleSettings(false);
  }

  render() {
    const { index, term, level, courses, isCart, isEditing } = this.props;
    const droppableId = (isCart) ? 'Cart' : index;

    let innerRef = null;
    let draggableProps = [];
    let dragHandleProps = [];
    let isDragging = false;
    if (this.props.provided.hasOwnProperty('innerRef')) {
      innerRef = this.props.provided.innerRef;
      draggableProps = this.props.provided.draggableProps;
      dragHandleProps = this.props.provided.dragHandleProps;
    }
    if (this.props.snapshot.hasOwnProperty('isDragging')) {
      isDragging = this.props.snapshot.isDragging;
    }

    return (
      <div ref={ innerRef } { ...draggableProps }>
        <Paper
          zDepth={ 1 }
          style={ styles.board(isCart) }
        >
          <div style={ styles.header(isDragging) } { ...dragHandleProps }>
            <div style={ styles.box } />
            <div style={{ ...styles.box, ...styles.boardTitle }}>
              <span>{ term }</span>
              { (!isCart && level.length > 0) && (
                <span style={ styles.level }>{ level }</span>
              ) }
            </div>
            <div style={ styles.box } >
              {
                isEditing && (
                  <IconMenu
                    iconButtonElement={ <IconButton><MoreVertIcon /></IconButton> }
                    anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                    targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                    iconStyle={ styles.editIcon }
                    onRequestChange={ this.toggleSettings }
                    open={ this.state.settingsOpen }
                    useLayerForClickAway
                  >
                    {
                      isCart
                        ? <MenuItem primaryText="Clear Cart" onClick={ this.clearBoard } />
                        : (
                          <div>
                            <MenuItem primaryText="Edit Name" onClick={ this.openRenameDialog } />

                            {/* If screen of device is 'sm' and in portrait mode, then Dialog Import Courses wont open, 
                            it will open in landscape mode for more comfort. 
                            Using module screen-orientation.
                            */}
                            <DeviceOrientation lockOrientation={'landscape'}>
                              <Orientation orientation='landscape' alwaysRender={false}>
                                <MenuItem primaryText="Import Courses" onClick={ this.openImportDialog } />
                              </Orientation>
                              <Orientation orientation='portrait' alwaysRender={false}>
                                <MenuItem primaryText="Import Courses" onClick={ this.openRotationDialog } />
                              </Orientation>
                            </DeviceOrientation>
                            
                            
                            <MenuItem primaryText="Clear Term" onClick={ this.clearBoard } />
                            <MenuItem primaryText="Delete Term" onClick={ this.deleteBoard } />
                          </div>
                        )
                    }
                  </IconMenu>
                )
              }
            </div>
          </div>
          <div style={ styles.listContainer(isCart) }>
            <Droppable
              droppableId={ droppableId }
              type={ DragTypes.COURSE }
            >
              { (provided, snapshot) => (
                <div
                  ref={ provided.innerRef }
                  style={ getListStyle(snapshot.isDraggingOver) }
                >
                  { renderCourses(
                    !isCart && !snapshot.isDraggingOver,
                    isEditing,
                    courses,
                    this.openAddDialog,
                    snapshot.isDraggingOver
                  ) }
                  { provided.placeholder }
                </div>
              ) }
            </Droppable>
          </div>
          <Dialog
            modal={ false }
            open={ this.state.renameDialogOpen }
            onRequestClose={ this.closeRenameDialog }
            contentStyle={ styles.responsiveDialog }
            
          >
            <DialogTitle id="responsive-dialog-title">{"Rename Board"}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                  <TextField
                    hintText="e.g. Winter 2019"
                    floatingLabelText="New Board Name"
                    value={ this.state.reterm }
                    errorText={ this.state.renameError }
                    onChange={ this.onChangeRenameText }
                  />
                  <SelectField
                    floatingLabelText="Term Level"
                    value={ this.state.relevel }
                    onChange={ this.onChangeRelevel }
                  >
                    <MenuItem value="1A" primaryText="1A" />
                    <MenuItem value="1B" primaryText="1B" />
                    <MenuItem value="2A" primaryText="2A" />
                    <MenuItem value="2B" primaryText="2B" />
                    <MenuItem value="3A" primaryText="3A" />
                    <MenuItem value="3B" primaryText="3B" />
                    <MenuItem value="4A" primaryText="4A" />
                    <MenuItem value="4B" primaryText="4B" />
                    <MenuItem value="5A+" primaryText="5A+" />
                  </SelectField>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <FlatButton
                label="Cancel"
                primary
                onClick={ this.closeRenameDialog }
              />
              <FlatButton
                label="Submit"
                primary
                onClick={ this.onRename }
              />
                </DialogActions>
          </Dialog>

            {/* Dialog for portrait mode active, to rotate device */}
          <Dialog
          modal={ false }
          open={ this.state.rotationDialogOpen }
          onRequestClose={ this.closeRotationDialog }
           >
              <DialogTitle id="responsive-dialog-title">{"Import Courses"}</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Please rotate your dispaly
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <FlatButton
                    label="Cancel"
                    primary
                    onClick={ this.closeRotationDialog }
                  />
                </DialogActions>
          </Dialog>

          <Dialog
            modal={ false }
            open={ this.state.importDialogOpen }
            onRequestClose={ this.closeImportDialog }
            fullScreen = {true}
          >
            <DialogTitle id="responsive-dialog-title">{"Import Courses"}</DialogTitle>
            <DialogContent>
              <Parser onChange={ this.onChangeImportText } />
            </DialogContent>
            <DialogActions>
              <FlatButton
                label="Cancel"
                primary
                onClick={ this.closeImportDialog }
              />
              <FlatButton
                label="Submit"
                primary
                onClick={ this.onImport }
              />
            </DialogActions>
          </Dialog>
          <Dialog
            modal={ false }
            open={ this.state.addDialogOpen }
            onRequestClose={ this.closeAddDialog }
            contentStyle={ styles.responsiveDialog }
          >
            <DialogTitle id="responsive-dialog-title">{"Add Course"}</DialogTitle>
            <DialogContent>
              <SearchBar onResult={ this.onSearchResult } courseOnly />
            </DialogContent>
            <DialogActions>
              <FlatButton
                label="Cancel"
                primary
                onClick={ this.closeAddDialog }
              />
            </DialogActions>
          </Dialog>
        </Paper>
      </div>
    );
  }
}
