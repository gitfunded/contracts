import GitHub from 'github-api';

export default class GitHubApi {

    constructor(accessToken) {

        this.gh = new GitHub({
            token: accessToken

        });


    }

    getProfileDetails() {
        let me = this.gh.getUser();
        me.getProfile(function(err, profile) {
            console.log(profile);
        });
    }

    getRepoDetails(callbackHandler) {

           let me = this.gh.getUser();
           let myOrg = this.gh.getOrganization('gitfunded');
           me.listRepos(((err, repos) => {

               try {
                   callbackHandler(repos);
               }
               catch (error) {
                   // TODO: Fix the GitHub api callback error
                       console.log(error)
                   }
           }));
        myOrg.getRepos(((err, repos) => {
            console.log(repos)
            try {
                callbackHandler(repos);
            }
            catch (error) {
                // TODO: Fix the GitHub api callback error
                console.log(error)
            }
        }));

    }


    getRepoDetails() {
        let repo = this.gh.getRepo('gitfunded', 'gitfunded-issues');
        repo.getDetails(function(err, details)  {

            try {
                // callbackHandler(issues);
                console.log(details);
            }
            catch (error) {
                // TODO: Fix the GitHub api callback error
                console.log(error)
            }
        });



    }

    getIssues(user, repo, callbackHandler) {

        let repoIssue = this.gh.getIssues(user, repo);
        repoIssue.listIssues([],function(err, issues)  {

            try {
                callbackHandler(issues);
            }
            catch (error) {
                // TODO: Fix the GitHub api callback error
                console.log(error)
            }
        });


    }

}
module.export = GitHubApi;
