const dataFilter = {
    episodeFilter: (rawData) => {
        FilteredEpisodes = {
            "webtoonIdx": rawData.webtoonIdx,
            "episodeIdx": rawData.episodeIdx,
            "webtoonName": rawData.webtoonName,
            "title": rawData.title,
            "views": rawData.views,
            "createdTime": rawData.createdTime,
            "thumbnail": rawData.thumbnail
        }
        return FilteredEpisodes;
    },
    detailFilter : (rawData) => {
        FilteredEpisodes = {
            "webtoonName": rawData.webtoonName,
            "detail": rawData.detail,   
        }
        return FilteredEpisodes;
    },
    commentFilter : (rawData) => {
        FilteredComments = {
            "commentIdx": rawData.commentIdx,
            "content": rawData.content,
            "createdTime": rawData.createdTime,
            "userName": rawData.userName,
            "image": rawData.image
        }
        return FilteredComments;
    }
};

module.exports = dataFilter;