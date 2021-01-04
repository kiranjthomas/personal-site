import React from "react";
import "./App.css";
import { Container } from "@material-ui/core";
import styled from "styled-components";

const StyledH5 = styled.h5`
  color: #1abc9c;
  font-size: 23px;
  margin: 8px 0 0;
  text-transform: uppercase;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
  font-weight: 600;
  font-family: Source Sans Pro, sans-serif;
  letter-spacing: 3px;
  line-height: 25.3px;
  text-size-adjust: 100%;
`;

const StyledH1 = styled.h1`
  color: rgb(255, 255, 255);
  font-size: 50px;
  margin: 8px 0 0;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
  font-weight: 700;
  font-family: Source Sans Pro, sans-serif;
  letter-spacing: 3px;
  line-height: 55px;
  text-size-adjust: 100%;
`;

const SocialDiv = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
`;

const SocialLinks = styled.a`
  padding: 4.536px;
  font-size: 11.34px;
  color: rgb(255, 255, 255);
`;

// const websiteStack = {
//   digitalOcean: {
//     img: "link",
//   },
//   caddy: {
//     img: "link",
//   },
//   react: {
//     img: "link",
//   },
//   materialUI: {
//     img: "link",
//   },
// };

const StyledDiv = styled.div`
  margin: 16px 0 0;
`;

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Container maxWidth="lg">
          <StyledH5>HI THERE</StyledH5>
          <StyledH1>I'm Kiran Thomas</StyledH1>
          <StyledDiv>I'm a Software Engineer in Austin, TX.</StyledDiv>
          <StyledDiv>
            I built this site with Terraform, Docker, Caddy, React, and
            Material UI.
          </StyledDiv>
          <StyledDiv>
            At work, I build internal and external services in AWS.
          </StyledDiv>
          {/* <div>This website is powered by:</div> */}
          {/* <Grid container spacing={2}>
            {websiteStack.forEach((value) => {
                console.log(value)
            })}
          </Grid> */}
          {/* <div>At HEB, I build internal and external services in AWS</div> */}
          <SocialDiv>
            <SocialLinks
              href="https://www.linkedin.com/in/kiranjthomas/"
              target="_blank"
            >
              <i className="fa fa-linkedin fa-3x"></i>
            </SocialLinks>
            <SocialLinks
              href="https://www.github.com/kiranjthomas"
              target="_blank"
            >
              <i className="fa fa-github fa-3x"></i>
            </SocialLinks>
            <SocialLinks
              href="https://www.twitter.com/kiranscrtweets"
              target="_blank"
            >
              <i className="fa fa-twitter fa-3x"></i>
            </SocialLinks>
            <SocialLinks href="mailto:kiranjthomas@gmail.com" target="_blank">
              <i className="fa fa-envelope fa-3x"></i>
            </SocialLinks>
          </SocialDiv>
        </Container>
      </header>
    </div>
  );
}

export default App;
