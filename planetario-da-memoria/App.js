// App.js - jogo de memória com login e leaderboard (classe-based)
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ImageBackground,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const images = [
  { id: 1, image: require("./assets/4.png") },
  { id: 2, image: require("./assets/6.png") },
  { id: 3, image: require("./assets/7.png") },
  { id: 4, image: require("./assets/8.png") },
  { id: 5, image: require("./assets/9.png") },
  { id: 6, image: require("./assets/10.png") },
  { id: 7, image: require("./assets/11.png") },
  { id: 8, image: require("./assets/12.png") },
];

const cardBackImage = require("./assets/card-back.png");

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tela: "login", // login, inicio, jogo, vitoria, leaderboard
      nome: "",
      modo: "",
      cards: [],
      flipped: [],
      matched: [],
      moves: 0,
      leaderboard: { facil: [], desafiador: [] },
    };
  }

  componentDidMount() {
    this.carregarLeaderboard();
  }

  carregarLeaderboard = async () => {
    try {
      const data = await AsyncStorage.getItem("leaderboard");
      if (data) {
        this.setState({ leaderboard: JSON.parse(data) });
      }
    } catch (e) {
      console.warn("Erro ao carregar leaderboard", e);
    }
  };

  salvarLeaderboard = async (modo, nome, moves) => {
    try {
      const lb = { ...this.state.leaderboard };
      // garante que a lista exista
      if (!Array.isArray(lb[modo])) lb[modo] = [];

      lb[modo].push({ nome, moves });
      lb[modo].sort((a, b) => a.moves - b.moves);
      lb[modo] = lb[modo].slice(0, 10);

      await AsyncStorage.setItem("leaderboard", JSON.stringify(lb));
      this.setState({ leaderboard: lb });
    } catch (e) {
      console.warn("Erro ao salvar leaderboard", e);
    }
  };

  login = () => {
    if (this.state.nome.trim() === "") return;
    this.setState({ tela: "inicio" });
  };

  iniciarJogo = (modo) => {
    const duplicated = [...images, ...images].map((c, i) => ({
      ...c,
      key: i.toString(),
      flipped: false,
    }));

    this.setState({
      modo,
      tela: "jogo",
      cards: duplicated.sort(() => Math.random() - 0.5),
      flipped: [],
      matched: [],
      moves: 0,
    });
  };

  flipCard = (card) => {
    const { flipped, matched, cards } = this.state;

    if (flipped.length < 2 && !card.flipped && !matched.includes(card.id)) {
      const newCards = cards.map((c) =>
        c.key === card.key ? { ...c, flipped: true } : c
      );

      const newFlipped = [...flipped, { ...card, flipped: true }];

      this.setState({ cards: newCards, flipped: newFlipped }, () => {
        if (this.state.flipped.length === 2) {
          setTimeout(() => {
            this.verificarCartas(this.state.modo);
          }, 800);
        }
      });
    }
  };

  verificarCartas = (modo) => {
    const { flipped, matched, cards, moves, nome } = this.state;
    if (flipped.length < 2) return;

    const [a, b] = flipped;
    let newMatched = [...matched];
    let newCards = [...cards];

    if (a.id === b.id) {
      newMatched.push(a.id);
    } else {
      newCards = cards.map((c) =>
        c.key === a.key || c.key === b.key ? { ...c, flipped: false } : c
      );

      if (modo === "desafiador") {
        // perde todos os pares se errar
        newMatched = [];
        newCards = newCards.map((c) => ({ ...c, flipped: false }));
      }
    }

    this.setState(
      {
        matched: newMatched,
        cards: newCards,
        flipped: [],
        moves: moves + 1,
      },
      () => {
        if (this.state.matched.length === images.length) {
          // moves já foi incrementado acima, mas queremos salvar o total final
          this.salvarLeaderboard(modo, nome, this.state.moves);
          this.setState({ tela: "vitoria" });
        }
      }
    );
  };

  renderCard = ({ item }) => {
    const { matched } = this.state;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => this.flipCard(item)}
        activeOpacity={0.8}
      >
        {item.flipped || matched.includes(item.id) ? (
          <Image source={item.image} style={styles.image} />
        ) : (
          <Image source={cardBackImage} style={styles.image} />
        )}
      </TouchableOpacity>
    );
  };

  render() {
    const { tela, cards, moves, leaderboard, nome } = this.state;

    // LOGIN
    if (tela === "login") {
      return (
        <ImageBackground
          source={require("./assets/fundo.png")}
          style={styles.background}
          resizeMode="cover"
        >
        <View style={styles.container}>
          <Text style={styles.title}>Planetário da Memória</Text>
          <Text style={styles.subtitle}>Digite seu nome:</Text>

          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor="#ccc"
            value={this.state.nome}
            onChangeText={(nome) => this.setState({ nome })}
          />

          <TouchableOpacity style={styles.button} onPress={this.login}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        </View>
        </ImageBackground>
      );
    }

    // INÍCIO
    if (tela === "inicio") {
      return (
        <ImageBackground
          source={require("./assets/fundo.png")}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.container1}>
            <Text style={styles.title}>Planetário da Memória</Text>
            <Text style={styles.subtitle}>Iniciar Jogo Em:</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => this.iniciarJogo("facil")}
            >
              <Text style={styles.buttonText}>Fácil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#d9534f" }]}
              onPress={() => this.iniciarJogo("desafiador")}
            >
              <Text style={styles.buttonText}>Desafiador</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#28a745" }]}
              onPress={() => this.setState({ tela: "leaderboard" })}
            >
              <Text style={styles.buttonText}>Leaderboard</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 20 }}>
              <Text style={{ color: "#fff" }}>Logado como: {nome || "—"}</Text>
            </View>
          </View>
        </ImageBackground>
      );
    }

    // LEADERBOARD
    if (tela === "leaderboard") {
      return (
        <ImageBackground
          source={require("./assets/fundo.png")}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={[styles.container, { paddingTop: 60 }]}>
            <Text style={styles.title}>Leaderboard</Text>

            <Text style={[styles.subtitle, { marginTop: 10 }]}>Modo Fácil</Text>
            {leaderboard.facil.length === 0 ? (
              <Text>Nenhum registro ainda.</Text>
            ) : (
              leaderboard.facil.map((p, i) => (
                <Text key={i}>
                  {i + 1}. {p.nome} - {p.moves} jogadas
                </Text>
              ))
            )}

            <Text style={[styles.subtitle, { marginTop: 20}]}>
              Modo Desafiador
            </Text>
            {leaderboard.desafiador.length === 0 ? (
              <Text>Nenhum registro ainda.</Text>
            ) : (
              leaderboard.desafiador.map((p, i) => (
                <Text key={i}>
                  {i + 1}. {p.nome} - {p.moves} jogadas
                </Text>
              ))
            )}

            <TouchableOpacity
              style={[styles.button, { marginTop: 30 }]}
              onPress={() => this.setState({ tela: "inicio" })}
            >
              <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      );
    }

    // VITÓRIA
    if (tela === "vitoria") {
      return (
        <ImageBackground
          source={require("./assets/fundo2.png")}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.container}>
            <Text style={styles.title}>Parabéns!</Text>
            <Text style={styles.subtitle}>Você completou o jogo em {moves} jogadas.</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.setState({ tela: "inicio" })}
            >
              <Text style={styles.buttonText}>Voltar ao Início</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      );
    }

    // JOGO
    return (
      <ImageBackground
        source={require("./assets/fundo2.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Planetário da Memória</Text>
          <Text style={styles.subtitle}>Jogadas: {moves}</Text>

          <FlatList
            data={cards}
            renderItem={this.renderCard}
            keyExtractor={(item) => item.key}
            numColumns={4}
            contentContainerStyle={styles.grid}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => this.iniciarJogo(this.state.modo)}
          >
            <Text style={styles.buttonText}>Reiniciar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ tela: "inicio" })}
          >
            <Text style={styles.buttonText}>Voltar ao Início</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  container1: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    marginTop: -100,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: "white",
  },
  grid: {
    alignItems: "center",
  },
  card: {
    width: 90,
    height: 90,
    margin: 2,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    minWidth: 160,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  input: {
    width: 280,
    height: 44,
    borderWidth: 1,
    borderColor: "#fff",
    color: "#fff",
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
