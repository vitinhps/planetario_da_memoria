import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ImageBackground,
} from "react-native";

// Cartas do jogo
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
      tela: "inicio", // "inicio", "jogo", "vitoria"
      modo: "",
      cards: [],
      flipped: [],
      matched: [],
      moves: 0,
    };
  }

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
    const { flipped, matched, cards, modo } = this.state;

    if (flipped.length < 2 && !card.flipped && !matched.includes(card.id)) {
      const newCards = cards.map((c) =>
        c.key === card.key ? { ...c, flipped: true } : c
      );

      const newFlipped = [...flipped, { ...card, flipped: true }];

      this.setState({ cards: newCards, flipped: newFlipped }, () => {
        if (this.state.flipped.length === 2) {
          setTimeout(() => {
            this.verificarCartas(modo);
          }, 800); // intervalo entre virar e verificar
        }
      });
    }
  };

  verificarCartas = (modo) => {
    const { flipped, matched, cards, moves } = this.state;
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
    const { tela, cards, moves } = this.state;

    if (tela === "inicio") {
      return (
      <ImageBackground source={require("./assets/fundo.png")} style={styles.background} resizeMode="cover">
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
        </View>
      </ImageBackground>
      );
    }
  
    if (tela === "vitoria") {
      return (
        <ImageBackground source={require("./assets/fundo2.png")} style={styles.background} resizeMode="cover">
        <View style={styles.container}>
          <Text style={styles.title}>Parabéns!</Text>
          <Text style={styles.subtitle}>Você completou o jogo!</Text>
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

    return (
      <ImageBackground source={require("./assets/fundo2.png")} style={styles.background} resizeMode="cover">
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
        <View style={styles.box}>
         <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ tela: "inicio" })}
          >
            <Text style={styles.buttonText}>Voltar ao Início</Text>
          </TouchableOpacity>
        </View>
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
    color: 'white'
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: 'white',
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
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  background: {
  flex: 1,
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
},
  box: {
    marginBottom: 50,
  },
});
