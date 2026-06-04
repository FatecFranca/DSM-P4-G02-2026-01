import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Funcionando sim</Text>
      <Text>ADOROO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
      container:{
        flex: 1,
        backgroundColor: "#FFF",
      },
  //     content:{
  //       alignSelf: 'center',
  //       width: "98%",
  //       height: 120,
  //       marginBottom: 20,
  //       backgroundColor: "#f1f1f1",
  //       alignItems: 'center',
  //       justifyContent: 'center',
  //     },
       header:{
        backgroundColor: '#004AAD',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 10,
        paddingRight: 10,
        height: 80,
        marginTop: 0,
        
    },
     mensagem:{
      width:50,
      height:50,
      fontSize: 40,
      fontWeight: 'bold',
      color: '#fff' ,
     },
    buttonn: {
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: '#fff', 
      borderWidth: 0.5, 
      borderColor: '#fff', 
      width:45,
      height:45, 
      borderRadius: 5, 
      margin: 5, 
      resizeMode: 'contain',  },
  });