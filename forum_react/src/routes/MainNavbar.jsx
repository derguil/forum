import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, Outlet } from 'react-router-dom'
import { Button, Container, Nav, Navbar, Row, Col, ListGroup, NavDropdown, Image }  from 'react-bootstrap';
import accountImg from './../assets/accountImg.svg'
import chattingImg from './../assets/chattingImg.svg'

function MainNavbar(){
  let navigate = useNavigate()
  return (
    <div>
      <Navbar bg="light" data-bs-theme="light">
        <Container>
          <Navbar.Brand as={Link} to="/">홈</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/forum">게시판</Nav.Link>
          </Nav>
          <Image src={chattingImg} rounded onClick={()=>{navigate("/message")}}/>  
          <Image src={accountImg} rounded onClick={()=>{navigate("/mypage")}}/>  
        </Container>
      </Navbar>
      <Outlet></Outlet>
    </div>
  )
}

export default MainNavbar