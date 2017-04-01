var github = require('octonode');
var async = require('async');
var suppose = require('suppose');
var fs = require('fs');
var client = github.client(/* Personal Access Token */);

var ghme = client.me();
var ghrepo, ghissue;

run = function() {
    ghme.notifications({}, function(err, content, status) {
        console.log("Fetch Notification Status = " + status.status);
        read_notifs(content);
    });

    function read_notifs(content) {
        content.forEach(function(data) {
            if (data.reason == 'mention') {
                ghnotification = client.notification(data.id);
                ghnotification.markAsRead(function(err, data1, data2) {
                    console.log("Mark Notification as Read = " + data2.status);
                    ghissue = client.issue(data.repository.full_name, data.subject.url[data.subject.url.length - 1]);
                    ghissue.createComment({
                        body: 'Howdy Buddy! Getting your super coafile ready!'
                    }, function(err, data_i, data_j) {
                        console.log("Comment Status = " + data_j.status);

                        if (data_j.status == '201 Created') {


                            var spawn = require('child_process').spawn;
                            console.log(data);
                            var git_url = 'git clone https://github.com/' + data.repository.full_name
                            var exec = require('child_process').execSync;
                            function puts(error, stdout, stderr) { sys.puts(stdout) }
                            exec(git_url, puts);



                              var test = spawn('coala-quickstart', ['-C'], {
                                  stdio: 'inherit',
                                  cwd : data.repository.name
                              });
                              test.on('close', (code) => {
                                  console.log('coafile creation process exited with code ${code}');



                                  if (code == 0){

                                    ghissue.createComment({
                                        body: 'coafile creation process Successful! :tada: :tada: :tada:'
                                    }, function(err, d_i, d_j) {
                                        console.log("Comment status");
                                    })

                                    fs.readFile('./' + data.repository.name + '/.coafile', function read(err, data) {
                                        if (err) {
                                            throw err;
                                        }

                                        ghissue.createComment({
                                            body: '```' + data.toString() + '```'
                                        }, function(err, d_i, d_j) {
                                            console.log("Comment Status = " + d_j.status);

                                        })

                                    });
                                  } else{
                                    ghissue.createComment({
                                        body: '```' + data.toString() + '```'
                                    }, function(err, d_i, d_j) {
                                        console.log("coafile creation process failed! :astonished: ");
                                    })
                                  }

                                  exec('rm -rf ' + data.repository.name, puts);
                              });

                        }
                    });
                });

            }
        })
    }
}

setInterval(function() {
    try {
        run();
    } catch (e) {
        console.log(e);
    }
}, 10000);
