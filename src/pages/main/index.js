import React, { Component } from "react";
import api from "../../services/api";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Navbar, Nav, NavDropdown, Form, FormControl, Button, Table, Pagination } from 'react-bootstrap';

export default class Main extends Component {
  state = {
    senadores: [],
    senadoresFilter: [],
    codParlamentar: [],
    paginationItems: 0,
    selectedPage: 1,
    rowsInPage: 10,
    senadorSelecionado: null,
    filterText: ''
  }

  componentDidMount() {
    this.loadSenadores();
  }

  loadSenadores = async () => {
    const response = await api.get('/lista/atual.json')
    this.setState({ senadores: response.data.ListaParlamentarEmExercicio.Parlamentares.Parlamentar, senadoresFilter: response.data.ListaParlamentarEmExercicio.Parlamentares.Parlamentar })
    console.log(response.data.ListaParlamentarEmExercicio.Parlamentares);
    this.setState({
      codParlamentar: response.data.ListaParlamentarEmExercicio.Parlamentares.Parlamentar.map(res => {
        this.codParlamentar = res.IdentificacaoParlamentar.CodigoParlamentar;
        console.log(this.codParlamentar);
        const response = api.get(`/${this.codParlamentar}/comissoes.json`);
        response.then((value) => {
          let cod = value.data.MembroComissaoParlamentar;
          console.log(cod);
        })
      })
    })
  }

  getPaginationItems = () => {
    let active = this.state.selectedPage;
    let items = [];
    let pages = (this.state.senadoresFilter.length / this.state.rowsInPage);
    for (let number = 1; number <= (pages < 1 ? 1 : pages); number++) {
      items.push(
        <Pagination.Item key={number} active={number === active}>
          {number}
        </Pagination.Item>,
      );
    }
    return items;
  }

  pageChanged = (e) => {
    if (e.target.text) {
      let clickedPage = parseInt(e.target.text);
      if (clickedPage != this.state.selectedPage)
        this.setState({ selectedPage: clickedPage });

    }
  }

  renderTableRows = () => {
    let items = [];
    let start = (this.state.selectedPage == 1 ? 1 : (this.state.rowsInPage * (this.state.selectedPage - 1)) + 1);
    let end = 0;

    if (this.state.selectedPage == 1)
      end = this.state.rowsInPage
    else if (this.state.selectedPage == parseInt(this.state.senadoresFilter.length / this.state.rowsInPage))
      end = this.state.senadoresFilter.length;
    else
      end = (start + this.state.rowsInPage) - 1;

    for (let number = start; number <= end; number++) {
      let data = this.state.senadoresFilter[number - 1];
      if (!data)
        continue;

      items.push(
        <tr onClick={() => { this.onClickRowTable(data) }} key={`tr${number}${data.IdentificacaoParlamentar.CodigoParlamentar}`}>
          <td key={`td${number}${data.IdentificacaoParlamentar.CodigoParlamentar}`}>{number}</td>
          <td key={`td2${number}${data.IdentificacaoParlamentar.CodigoParlamentar}`}>{data.IdentificacaoParlamentar.NomeCompletoParlamentar}</td>
          <td key={`td3${number}${data.IdentificacaoParlamentar.CodigoParlamentar}`}>{data.IdentificacaoParlamentar.UfParlamentar}</td>
          <td key={`td4${number}${data.IdentificacaoParlamentar.CodigoParlamentar}`}>{data.IdentificacaoParlamentar.SiglaPartidoParlamentar}</td>
        </tr>
      );
    }

    return items;
  }

  onClickRowTable(e) {
    this.setState({ senadorSelecionado: e });
  }

  filterTable = () => {
    console.log('filterTable', this.state.filterText);
    if (!this.isEmptyOrSpaces(this.state.filterText)) {
      let newArray = [];

      this.state.senadores.forEach(element => {
        if (element.IdentificacaoParlamentar.NomeCompletoParlamentar.toUpperCase().includes(this.state.filterText.toUpperCase()) ||
          element.IdentificacaoParlamentar.UfParlamentar.toUpperCase().includes(this.state.filterText.toUpperCase()) ||
          element.IdentificacaoParlamentar.SiglaPartidoParlamentar.toUpperCase().includes(this.state.filterText.toUpperCase()))
          newArray.push(element);
      });

      this.setState({ senadoresFilter: newArray, selectedPage: 1, senadorSelecionado: null });
    }
    else
      this.setState({ senadoresFilter: this.state.senadores, selectedPage: 1, senadorSelecionado: null });
  }

  isEmptyOrSpaces(str) {
    if (!str)
      return true;
    else
      return str === null || str.match(/^ *$/) !== null;
  }

  render() {
    return (
      <>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">Listagem de Senadores</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            
          </Nav>
          <Form inline>
            <FormControl type="text" placeholder="Digite aqui para pesquisar" className="mr-sm-2" onChange={e => this.setState({ filterText: e.target.value })} />
            <Button variant="outline-success" onClick={this.filterTable}>Buscar</Button>
          </Form>
        </Navbar.Collapse>
      </Navbar>

      {this.state.senadoresFilter.length > 0 &&
        <Container>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>UF</th>
                <th>Partido</th>
              </tr>
            </thead>
            <tbody>
              {this.renderTableRows()}
            </tbody>
          </Table>

          <Pagination onClick={this.pageChanged}>{this.getPaginationItems()}</Pagination>
        </Container>
      }

      {this.state.senadoresFilter.length == 0 &&
        <p>Não foram encontrados senadores</p>
      }

      {this.state.senadorSelecionado &&
        <Container>
          <Row className="justify-content-md-center">
            <article key={this.state.senadorSelecionado.IdentificacaoParlamentar.CodigoParlamentar}>
              <ul>
                <li>
                  <strong>
                    Nome: {this.state.senadorSelecionado.IdentificacaoParlamentar.NomeCompletoParlamentar}
                  </strong>
                </li>
                <li>
                  UF: {this.state.senadorSelecionado.IdentificacaoParlamentar.UfParlamentar}
                </li>
                <li>
                  Partido: {this.state.senadorSelecionado.IdentificacaoParlamentar.SiglaPartidoParlamentar}
                </li>
                <li>
                  <img class="sombra" src={this.state.senadorSelecionado.IdentificacaoParlamentar.UrlFotoParlamentar} />
                </li>
                <li>
                  Membro da mesa: {this.state.senadorSelecionado.IdentificacaoParlamentar.MembroMesa}
                </li>
                <li>
                  Membro da Liderança: {this.state.senadorSelecionado.IdentificacaoParlamentar.MembroLideranca}
                </li>
                <li>
                  Página Parlamentar:
                    <a href={this.state.senadorSelecionado.IdentificacaoParlamentar.UrlPaginaParlamentar}>
                    {this.state.senadorSelecionado.IdentificacaoParlamentar.UrlPaginaParlamentar}
                  </a>
                </li>
                <li>

                </li>
              </ul>
            </article>
          </Row>
        </Container>
      }
      {/* <Container>
        <p>listaSenadores: {this.state.senadores.length} </p>
        <Row className="justify-content-md-center">
          {this.state.senadores.map(senador => (
            <article key={senador.IdentificacaoParlamentar.CodigoParlamentar}>
              <ul>
                <li>
                  <strong>
                    Nome: {senador.IdentificacaoParlamentar.NomeCompletoParlamentar}
                  </strong>
                </li>
                <li>
                  UF: {senador.IdentificacaoParlamentar.UfParlamentar}
                </li>
                <li>
                  Partido: {senador.IdentificacaoParlamentar.SiglaPartidoParlamentar}
                </li>
                <li>
                  <img src={senador.IdentificacaoParlamentar.UrlFotoParlamentar} />
                </li>
                <li>
                  Membro da mesa: {senador.IdentificacaoParlamentar.MembroMesa}
                </li>
                <li>
                  Membro da Liderança: {senador.IdentificacaoParlamentar.MembroLideranca}
                </li>
                <li>
                  Página Parlamentar:
                    <a href={senador.IdentificacaoParlamentar.UrlPaginaParlamentar}>
                    {senador.IdentificacaoParlamentar.UrlPaginaParlamentar}
                  </a>
                </li>
                <li>

                </li>
              </ul>

            </article>
          ))}
        </Row>
      </Container> */}
      </>
    )
  }
}