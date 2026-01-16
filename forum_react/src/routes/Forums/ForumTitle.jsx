import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, Outlet } from 'react-router-dom'
import { Button, Container, Nav, Navbar, Row, Col, ListGroup, NavDropdown, Image, Card }  from 'react-bootstrap';
import axios from 'axios';

function ForumTitle({ forumtitle }) {
  return(
    <>
      <div className='wrap title' style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "24px", margin: 0 }}>{forumtitle}</h2>
      </div>
      <hr></hr>
    </>
  )
}

export default ForumTitle