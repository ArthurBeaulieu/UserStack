import '../scss/Home.scss';

const socket = io();

socket.on('news', msg => {
  console.log(msg)
});
