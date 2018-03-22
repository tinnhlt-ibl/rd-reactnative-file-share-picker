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
  Alert,
  ActionSheetIOS,
  Share,
  Linking
} from 'react-native';

import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import RNFetchBlob from 'react-native-fetch-blob'
import Mailer from 'react-native-mail';


const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

const iOSExcludedActivityLists = [
  "com.apple.UIKit.activity.PostToFacebook",
  "com.apple.UIKit.activity.PostToTwitter",
  "com.apple.UIKit.activity.PostToWeibo",
  "com.apple.UIKit.activity.Message",
  "com.apple.UIKit.activity.Print",
  "com.apple.UIKit.activity.CopyToPasteboard",
  "com.apple.UIKit.activity.AssignToContact",
  "com.apple.UIKit.activity.SaveToCameraRoll",
  "com.apple.UIKit.activity.AddToReadingList",
  "com.apple.UIKit.activity.PostToFlickr",
  "com.apple.UIKit.activity.PostToVimeo",
  "com.apple.UIKit.activity.PostToTencentWeibo",
  "com.apple.UIKit.activity.AirDrop",
  "com.apple.UIKit.activity.OpenInIBooks",
  "com.apple.UIKit.activity.MarkupAsPDF",
  "com.apple.reminders.RemindersEditorExtension", //Reminders
  "com.apple.mobilenotes.SharingExtension", // Notes
  "com.apple.mobileslideshow.StreamShareService", // iCloud Photo Sharing - This also does nothing :{
]

type Props = {};
export default class App extends Component<Props> {
  state = {
    fileName: '',
    fileSize: 0,
    data: '',

    fileToSavepath: ''
  }

  constructor(props) {
    super(props)
  }

  createDummyFiles() {
    const DocumentDir = RNFetchBlob.fs.dirs.DocumentDir;
    let fileToSavepath = DocumentDir + `/dummyToShare${Date.now()}.key`;
    let content = 'myNameTinTin';

    this.setState({
      fileToSavepath
    })

    RNFetchBlob.fs.writeFile(fileToSavepath, content, 'text');
  }

  componentDidMount() {
    this.createDummyFiles();
  }

  render() {
    const { fileName, fileSize, data } = this.state;
    const onSaveFile = Platform.OS === 'ios' ? this.onSaveFileIos : this.onEmail2

    return (
      <View style={styles.container}>

        <Button
          title="Save"
          onPress={onSaveFile.bind(this)}
          style={styles.button}
        />

        <Button
          title="Pick a File"
          onPress={this.onPickFile.bind(this)}
          style={styles.button}
        />

        {fileSize ? (
          <View>
            <Text>FileName: {fileName}</Text>
            <Text>FileSize: {fileSize}</Text>
            <Text>Frist 100Bytes: </Text>
            <Text>{data.substr(0, 100) + '...'}</Text>
          </View>
        ) : <View />
        }

      </View>
    );
  }

  onSaveFileIos() {
    const { fileToSavepath } = this.state;

    ActionSheetIOS.showShareActionSheetWithOptions({
      url: fileToSavepath,
      excludedActivityTypes: iOSExcludedActivityLists
    },
      (error) => {

      },
      (success, method) => {
        var text;
        if (success) {
          text = `Shared via ${method}`;
        } else {
          text = 'You didn\'t share';
        }
        Alert.alert(text)
      });
  }

  async onEmail2() {
    const { fileToSavepath } = this.state;

    Alert.alert(fileToSavepath);
    Mailer.mail({
      subject: 'need help',
      recipients: ['support@example.com'],
      ccRecipients: ['supportCC@example.com'],
      bccRecipients: ['supportBCC@example.com'],
      body: '',
      isHTML: true,
      attachment: {
        path: fileToSavepath,  // The absolute path of the file from which to read data.
        type: 'application/octet-stream',   // Mime Type: jpg, png, doc, ppt, html, pdf
        name: '',   // Optional: Custom filename for attachment
      }
    }, (error, event) => {
        console.log(error, event);
        if(error) {
          Alert.alert('Error', 'Could not send mail. Please send a mail to support@example.com');
        }
    });
  }

  onSaveFileMethodDefaul() {
    const { fileToSavepath } = this.state;
    
    Share.share({
      url: fileToSavepath
    }, {
      excludedActivityTypes: iOSExcludedActivityLists
    })
    .then(res => {
      Alert.alert('ok')
    })
    .catch(err => {
      console.log(err)
      Alert.alert('error')
    })
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
    if (uri.startsWith('file://'))
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
  button: {
    marginBottom: 20
  }
});
