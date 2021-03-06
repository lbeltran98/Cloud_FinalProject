import React, {Component} from 'react';
import FormErrors from "../FormErrors";
import Validate from "../utility/FormValidation";
import {Auth} from 'aws-amplify';
import Storage from "@aws-amplify/storage";
import { SetS3Config } from "../../index";

class LogIn extends Component {
  state = {
    username: "",
    password: "",
    errors: {
      cognito: null,
      blankfield: false
    }
  };

  clearErrorState = () => {
    this.setState({
      errors: {
        cognito: null,
        blankfield: false
      }
    });
  };

  handleSubmit = async event => {
    event.preventDefault();

    // Form validation
    this.clearErrorState();
    const error = Validate(event, this.state);
    if (error) {
      this.setState({
        errors: {
          ...this.state.errors,
          ...error
        }
      });
    }

    // AWS Cognito integration here

    try {
      const userObject = await Auth.signIn(this.state.username, this.state.password);
      console.log(userObject)
      this.props.auth.setAuthStatus(true);
      this.props.auth.setUser(userObject);
      let user = "" + this.state.username + Date.now() + ".json";
      let userData = {
        username: this.state.username,
        password: this.state.password,
        access: Date().toLocaleLowerCase()
      }
      SetS3Config("logins-finalproject", "public")
      Storage.put(user, userData).then(result => {
            this.upload = null;
            this.setState( { response: "Success uploading file to S3!"});
          }).catch(err => console.log(err));
      this
        .props
        .history
        .push("/")
    } catch (error) {
      let err = null;
      !error.message
        ? error = {
          "message": error
        }
        : err = error;
      this.setState({
        errors: {
          ...this.state.errors,
          cognito: err
        }
      })
    }
  };

  onInputChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
    document
      .getElementById(event.target.id)
      .classList
      .remove("is-danger");
  };

  render() {
    return (
      <section className="section auth">
        <div className="container">
          <h1>Log in</h1>
          <FormErrors formerrors={this.state.errors}/>

          <form onSubmit={this.handleSubmit}>
            <div className="field">
              <p className="control">
                <input
                  className="input"
                  type="text"
                  id="username"
                  aria-describedby="usernameHelp"
                  placeholder="Enter username or email"
                  value={this.state.username}
                  onChange={this.onInputChange}/>
              </p>
            </div>
            <div className="field">
              <p className="control has-icons-left">
                <input
                  className="input"
                  type="password"
                  id="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.onInputChange}/>
                <span className="icon is-small is-left">
                  <i className="fas fa-lock"></i>
                </span>
              </p>
            </div>
            <div className="field">
              <p className="control">
                <a href="/forgotpassword">Forgot password?</a>
              </p>
            </div>
            <div className="field">
              <p className="control">
                <button className="button is-success">
                  Login
                </button>
              </p>
            </div>
          </form>
        </div>
      </section>
    );
  }
}

export default LogIn;