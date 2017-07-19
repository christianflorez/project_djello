import { connect } from "react-redux";
import Board from "../components/Board";
import serialize from "form-serialize";
import { editSpecificBoard } from "../actions/specificBoard";

const mapStateToProps = state => {
  return {
    board: state.specificBoard.data
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onChangeBoardTitle: e => {
      e.preventDefault();
      const form = e.target;
      const data = serialize(form);
      dispatch(editSpecificBoard(ownProps.token, ownProps.boardId, data));
    }
  }
}

const BoardContainer = connect(mapStateToProps, mapDispatchToProps)(Board);

export default BoardContainer;