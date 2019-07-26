module.exports = function Wanttowatch(oldWanttowatch) {
    this.videos = oldWanttowatch.videos || {}
    this.totalQty = oldWanttowatch.totalQty || 0

    this.add = function(video, id) {
        var storedVideo = this.videos[id]
        if(!storedVideo) {
            storedVideo = this.videos[id] = {video: video}
        }
        this.totalQty++
    }

    this.generateArray = function() {
        var arr = []
        for(var id in this.videos) {
            arr.push(this.videos[id])
        }
        return arr
    }
}