require 'pathname'

project_root = Pathname.new(File.dirname(__FILE__)).parent.parent
require File.join(project_root, 'node_modules/expo-modules-autolinking/scripts/ios/autolinking_manager')
require File.join(project_root, 'node_modules/react-native/scripts/react_native_pods') 