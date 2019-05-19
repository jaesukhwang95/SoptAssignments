module.exports = 
        (rawBoardData) => {
        boardData = {
                "boardIdx": rawBoardData.boardIdx,
                "title" : rawBoardData.title,
                "content": rawBoardData.content,
                "writer": rawBoardData.writer,
                "writetime": rawBoardData.writetime,
        }
        return boardData;
}
