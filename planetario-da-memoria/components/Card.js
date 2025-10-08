import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';

const Card = ({ card, isFlipped, isMatched, onPress }) => {
  // A propriedade 'isMatched' é usada para manter a carta visível após a combinação.
  // A 'isFlipped' é para o estado temporário de virada.

  return (
    <TouchableOpacity
      onPress={() => !isFlipped && !isMatched && onPress(card)} // Só permite o clique se a carta não estiver virada ou combinada.
      style={[styles.card, isMatched && styles.matchedCard]}
      disabled={isFlipped || isMatched} // Desabilita o clique em cartas já viradas ou combinadas.
    >
      {isFlipped || isMatched ? (
        <Image source={card.image} style={styles.image} /> // Exibe a imagem da fruta.
      ) : (
        <Image source={require('../assets/card-back.png')} style={styles.image} /> // Exibe a imagem do verso da carta.
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 8,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchedCard: {
    // Opacidade para cartas combinadas, dando uma dica visual.
    opacity: 0.6,
  },
  image: {
    width: '200%',
    height: '125%',
    
  },
});

export default Card;