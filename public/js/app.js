$.scalpel.queue[".expired-date"] = function(){
  var date = $(this).text();
  var formatDate = moment(date).format("MMMM YYYY");
  $(this).text(formatDate);
};