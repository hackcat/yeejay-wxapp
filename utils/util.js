function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 秒转换成时间 MM:SS
function durationFormat(time) {

  let second = Math.floor(time / 1000);// 总秒
  let min = 0;// 分
  let sec = 0;// 秒
  if (second > 60) {
    min = Math.floor(second / 60);
    sec = Math.floor(second % 60);
  } else {
    sec = second;
  }
  if (min < 10) {
    min = "0" + min;
  }
  if (sec < 10) {
    sec = "0" + sec;
  }
  return min + ':' + sec;
}

module.exports = {
  formatTime: formatTime,
  durationFormat: durationFormat
}
