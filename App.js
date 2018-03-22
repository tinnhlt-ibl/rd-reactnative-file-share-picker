/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  Alert
} from 'react-native';

import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import RNFetchBlob from 'react-native-fetch-blob'


const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
  state = {
    fileName: '',
    fileSize: 0,
    data: '',
  }

  shareImageBase64 = {
    title: "React Native",
    message: "Hola mundo",
    url: REACT_ICON,
    subject: "Share Link" //  for email
  };

  constructor(props) {
    super(props)
  }

  render() {
    const { fileName, fileSize, data } = this.state;

    return (
      <View style={styles.container}>
        <Button
          title="Pick a File"
          onPress={this.onPickFile.bind(this)}
        />
        
        {fileSize ? ( 
          <View>
            <Text>FileName: {fileName}</Text>
            <Text>FileSize: {fileSize}</Text>
            <Text>Frist 100Bytes: </Text>
            <Text>{data.substr(0, 100) + '...'}</Text>
          </View>
        ) : <View/>
        }

      </View>
    );
  }
  
  onPickFile() {
    this.setState({
      fileSize: 0
    })

    DocumentPicker.show({
      filetype: [DocumentPickerUtil.allFiles()],
    }, (error, res) => {

      console.log(
        res
      );

      this.setState({
        fileName: res.fileName,
        fileSize: res.fileSize,
      })
      this.method3(res.uri);
    });
  }

  method3(uri) {
    const normalize = this.normalizePath(uri);
    RNFetchBlob.fs.readFile(normalize, 'base64')
      .then((data) => {
        const trimData = data;
        this.setState({
          data: data,
        })
        Alert.alert('ok');
      })
      .catch((err) => {
        console.error(err)
        Alert.alert('faled');
      })
  }

  normalizePath(uri) {
    if(uri.startsWith('file://'))
      return decodeURI(uri.split('file://')[1]);
    else
      return decodeURI(uri);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
